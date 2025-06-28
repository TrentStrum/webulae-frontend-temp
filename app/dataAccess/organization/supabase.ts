import type {
	Organization,
	OrganizationMember,
	OrganizationInvite,
} from '@/app/types/organization.types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { createServerSupabaseClient } from '@/app/lib/supabase/server';
import { DataAccessError, NotFoundError } from '@/app/lib/dataAccess';
import { randomUUID } from 'crypto';

export class SupabaseOrganizationDataAccess implements DataAccessInterface<Organization> {
	async getById(id: string): Promise<Organization> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organizations')
			.select('*')
			.eq('id', id)
			.single();

		if (error || !data) {
			throw new NotFoundError('Organization', id);
		}
		return data as Organization;
	}

	async getAll(): Promise<Organization[]> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organizations')
			.select('*')
			.order('name', { ascending: true });

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return data as Organization[];
	}

	async create(data: Partial<Organization>): Promise<Organization> {
		const supabase = await createServerSupabaseClient();
		const id = `org_${randomUUID()}`;
		const now = new Date().toISOString();

		const { data: inserted, error } = await supabase
			.from('organizations')
			.insert([{
				id,
				name: data.name ?? '',
				description: data.description ?? '',
				logo: data.logo ?? '',
				website: data.website ?? '',
				industry: data.industry ?? '',
				createdAt: now,
				updatedAt: now,
			}])
			.select()
			.single();

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return inserted as Organization;
	}

	async update(id: string, data: Partial<Organization>): Promise<Organization> {
		const supabase = await createServerSupabaseClient();
		const now = new Date().toISOString();

		// First check if the organization exists
		await this.getById(id);

		const updateData: Partial<Organization> = {
			...data,
			updatedAt: now,
		};

		const { data: updated, error } = await supabase
			.from('organizations')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return updated as Organization;
	}

	async delete(id: string): Promise<void> {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase
			.from('organizations')
			.delete()
			.eq('id', id);

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
	}

	// Organization-specific methods
	async getOrganizationsByUserId(userId: string): Promise<Organization[]> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organizations')
			.select(`
				*,
				organization_members!inner(userId, isActive)
			`)
			.eq('organization_members.userId', userId)
			.eq('organization_members.isActive', true)
			.order('name', { ascending: true });

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return data as Organization[];
	}

	async getOrganizationByPrimaryAdmin(userId: string): Promise<Organization | null> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organizations')
			.select(`
				*,
				organization_members!inner(userId, isPrimary, role)
			`)
			.eq('organization_members.userId', userId)
			.eq('organization_members.isPrimary', true)
			.eq('organization_members.role', 'admin')
			.limit(1)
			.single();

		if (error) {
			if (error.code === 'PGRST116') { // No rows returned
				return null;
			}
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return data as Organization;
	}
}

export class SupabaseOrganizationMemberDataAccess {
	async getMemberById(id: string): Promise<OrganizationMember> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organization_members')
			.select(`
				*,
				user_profiles!inner(id, name, email)
			`)
			.eq('id', id)
			.single();

		if (error || !data) {
			throw new NotFoundError('OrganizationMember', id);
		}

		// Transform to include user data
		const { user_profiles, ...memberData } = data;
		return {
			...memberData,
			user: user_profiles,
		} as OrganizationMember;
	}

	async getMembersByOrganizationId(organizationId: string): Promise<OrganizationMember[]> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organization_members')
			.select(`
				*,
				user_profiles!inner(id, name, email)
			`)
			.eq('organizationId', organizationId)
			.order('isPrimary', { ascending: false })
			.order('role', { ascending: true });

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}

		// Transform to include user data
		return data.map((row: any) => {
			const { user_profiles, ...memberData } = row;
			return {
				...memberData,
				user: user_profiles,
			} as OrganizationMember;
		});
	}

	async getMemberByOrganizationAndUser(
		organizationId: string,
		userId: string,
	): Promise<OrganizationMember | null> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organization_members')
			.select(`
				*,
				user_profiles!inner(id, name, email)
			`)
			.eq('organizationId', organizationId)
			.eq('userId', userId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') { // No rows returned
				return null;
			}
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}

		if (!data) return null;

		// Transform to include user data
		const { user_profiles, ...memberData } = data;
		return {
			...memberData,
			user: user_profiles,
		} as OrganizationMember;
	}

	async addMember(
		organizationId: string,
		userId: string,
		role: string,
		isPrimary: boolean = false,
	): Promise<OrganizationMember> {
		const supabase = await createServerSupabaseClient();
		const now = new Date().toISOString();

		// If this is a primary member, unset other primary members
		if (isPrimary) {
			await supabase
				.from('organization_members')
				.update({ isPrimary: false })
				.eq('organizationId', organizationId)
				.eq('isPrimary', true);
		}

		const { data, error } = await supabase
			.from('organization_members')
			.insert([{
				organizationId,
				userId,
				role,
				isPrimary,
				isActive: true,
				createdAt: now,
				updatedAt: now,
			}])
			.select(`
				*,
				user_profiles!inner(id, name, email)
			`)
			.single();

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}

		// Transform to include user data
		const { user_profiles, ...memberData } = data;
		return {
			...memberData,
			user: user_profiles,
		} as OrganizationMember;
	}

	async updateMember(id: string, data: Partial<OrganizationMember>): Promise<OrganizationMember> {
		const supabase = await createServerSupabaseClient();
		const now = new Date().toISOString();

		// If this is being set as primary, unset other primary members
		if (data.isPrimary) {
			const member = await this.getMemberById(id);
			await supabase
				.from('organization_members')
				.update({ isPrimary: false })
				.eq('organizationId', member.organizationId)
				.eq('isPrimary', true)
				.neq('id', id);
		}

		const updateData = {
			...data,
			updatedAt: now,
		};

		const { data: updated, error } = await supabase
			.from('organization_members')
			.update(updateData)
			.eq('id', id)
			.select(`
				*,
				user_profiles!inner(id, name, email)
			`)
			.single();

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}

		// Transform to include user data
		const { user_profiles, ...memberData } = updated;
		return {
			...memberData,
			user: user_profiles,
		} as OrganizationMember;
	}

	async removeMember(id: string): Promise<void> {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase
			.from('organization_members')
			.delete()
			.eq('id', id);

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
	}

	async getOrganizationRoleForUser(organizationId: string, userId: string): Promise<string | null> {
		const member = await this.getMemberByOrganizationAndUser(organizationId, userId);
		return member?.role || null;
	}

	async isPrimaryAdmin(organizationId: string, userId: string): Promise<boolean> {
		const member = await this.getMemberByOrganizationAndUser(organizationId, userId);
		return member?.isPrimary === true && member?.role === 'admin';
	}
}

export class SupabaseOrganizationInviteDataAccess {
	async getInviteById(id: string): Promise<OrganizationInvite> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organization_invites')
			.select('*')
			.eq('id', id)
			.single();

		if (error || !data) {
			throw new NotFoundError('OrganizationInvite', id);
		}
		return data as OrganizationInvite;
	}

	async getInvitesByOrganizationId(organizationId: string): Promise<OrganizationInvite[]> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organization_invites')
			.select('*')
			.eq('organizationId', organizationId)
			.order('createdAt', { ascending: false });

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return data as OrganizationInvite[];
	}

	async getInviteByToken(token: string): Promise<OrganizationInvite | null> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organization_invites')
			.select('*')
			.eq('token', token)
			.single();

		if (error) {
			if (error.code === 'PGRST116') { // No rows returned
				return null;
			}
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return data as OrganizationInvite;
	}

	async getInviteByEmail(organizationId: string, email: string): Promise<OrganizationInvite | null> {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('organization_invites')
			.select('*')
			.eq('organizationId', organizationId)
			.eq('email', email)
			.single();

		if (error) {
			if (error.code === 'PGRST116') { // No rows returned
				return null;
			}
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return data as OrganizationInvite;
	}

	async createInvite(organizationId: string, email: string, role: string): Promise<OrganizationInvite> {
		const supabase = await createServerSupabaseClient();
		const now = new Date().toISOString();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
		const token = randomUUID();

		const { data, error } = await supabase
			.from('organization_invites')
			.insert([{
				organizationId,
				email,
				role,
				token,
				expiresAt,
				createdAt: now,
				updatedAt: now,
			}])
			.select()
			.single();

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
		return data as OrganizationInvite;
	}

	async deleteInvite(id: string): Promise<void> {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase
			.from('organization_invites')
			.delete()
			.eq('id', id);

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
	}

	async deleteInviteByToken(token: string): Promise<void> {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase
			.from('organization_invites')
			.delete()
			.eq('token', token);

		if (error) {
			throw new DataAccessError(`Database error: ${error.message}`, 500, error);
		}
	}
}

export const organizationSupabaseDataAccess = new SupabaseOrganizationDataAccess();
export const organizationMemberSupabaseDataAccess = new SupabaseOrganizationMemberDataAccess();
export const organizationInviteSupabaseDataAccess = new SupabaseOrganizationInviteDataAccess(); 