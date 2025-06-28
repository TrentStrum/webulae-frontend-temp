import type { UserProfile } from '@/app/types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { createServerSupabaseClient } from '@/app/lib/supabase/server';

export const userProfileSupabaseDataAccess: DataAccessInterface<UserProfile> = {
	async getById(id) {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('user_profiles')
			.select('*')
			.eq('id', id)
			.single();

		if (error || !data) throw new Error('User not found');
		return data;
	},

	async getByClerkId(clerkUserId: string) {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('user_profiles')
			.select('*')
			.eq('clerk_user_id', clerkUserId)
			.single();

		if (error || !data) throw new Error('User profile not found');
		return data;
	},

	async getAll() {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase.from('user_profiles').select('*');
		if (error) throw new Error('Failed to fetch profiles');
		return data as UserProfile[];
	},

	async create(data) {
		const supabase = await createServerSupabaseClient();
		const { data: inserted, error } = await supabase
			.from('user_profiles')
			.insert([data])
			.select()
			.single();
		if (error) throw error;
		return inserted as UserProfile;
	},

	async update(id, data) {
		const supabase = await createServerSupabaseClient();
		const { data: updated, error } = await supabase
			.from('user_profiles')
			.update(data)
			.eq('id', id)
			.select()
			.single();
		if (error) throw error;
		return updated as UserProfile;
	},

	async delete(id) {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase.from('user_profiles').delete().eq('id', id);
		if (error) throw error;
	}
};

// User data access for the users table (admin-side user management)
export class SupabaseUserDataAccess {
	async getById(id: string) {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('id', id)
			.single();

		if (error || !data) throw new Error('User not found');
		return data;
	}

	async getByClerkId(clerkUserId: string) {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('clerk_user_id', clerkUserId)
			.single();

		if (error || !data) throw new Error('User not found');
		return data;
	}

	async getAll() {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase.from('users').select('*');
		if (error) throw new Error('Failed to fetch users');
		return data;
	}

	async create(data: {
		clerk_user_id: string;
		name: string;
		email: string;
		role?: string;
		company_name?: string;
		organization_name?: string;
	}) {
		const supabase = await createServerSupabaseClient();
		const { data: inserted, error } = await supabase
			.from('users')
			.insert([{
				clerk_user_id: data.clerk_user_id,
				name: data.name,
				email: data.email,
				role: data.role || 'user',
				company_name: data.company_name || '',
				organization_name: data.organization_name || '',
			}])
			.select()
			.single();
		if (error) throw error;
		return inserted;
	}

	async update(id: string, data: Partial<{
		name: string;
		email: string;
		role: string;
		company_name: string;
		organization_name: string;
	}>) {
		const supabase = await createServerSupabaseClient();
		const { data: updated, error } = await supabase
			.from('users')
			.update(data)
			.eq('id', id)
			.select()
			.single();
		if (error) throw error;
		return updated;
	}

	async updateByClerkId(clerkUserId: string, data: Partial<{
		name: string;
		email: string;
		role: string;
		company_name: string;
		organization_name: string;
	}>) {
		const supabase = await createServerSupabaseClient();
		const { data: updated, error } = await supabase
			.from('users')
			.update(data)
			.eq('clerk_user_id', clerkUserId)
			.select()
			.single();
		if (error) throw error;
		return updated;
	}

	async delete(id: string) {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase.from('users').delete().eq('id', id);
		if (error) throw error;
	}

	async deleteByClerkId(clerkUserId: string) {
		const supabase = await createServerSupabaseClient();
		const { error } = await supabase.from('users').delete().eq('clerk_user_id', clerkUserId);
		if (error) throw error;
	}
}
