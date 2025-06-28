import type { Project } from '@/app/types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { createServerSupabaseClient } from '@/app/lib/supabase/server';
import { DataAccessError, NotFoundError } from '@/app/lib/dataAccess';

export const projectSupabaseDataAccess: DataAccessInterface<Project> = {
	async getById(id) {
		try {
			const supabase = await createServerSupabaseClient();
			const { data, error } = await supabase
				.from('projects')
				.select('*')
				.eq('projectId', id)
				.single();

			if (error) throw new DataAccessError(`Supabase error: ${error.message}`, 500, error);
			if (!data) throw new NotFoundError('Project', id);
			
			return data;
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	},

	async getAll() {
		try {
			const supabase = await createServerSupabaseClient();
			const { data, error } = await supabase
				.from('projects')
				.select('*')
				.order('createdAt', { ascending: false });
				
			if (error) throw new DataAccessError(`Supabase error: ${error.message}`, 500, error);
			return data as Project[];
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	},

	async create(data) {
		try {
			const supabase = await createServerSupabaseClient();
			const { data: inserted, error } = await supabase
				.from('projects')
				.insert([data])
				.select()
				.single();
				
			if (error) throw new DataAccessError(`Supabase error: ${error.message}`, 500, error);
			return inserted as Project;
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	},

	async update(id, data) {
		try {
			const supabase = await createServerSupabaseClient();
			const { data: updated, error } = await supabase
				.from('projects')
				.update(data)
				.eq('projectId', id)
				.select()
				.single();
				
			if (error) throw new DataAccessError(`Supabase error: ${error.message}`, 500, error);
			if (!updated) throw new NotFoundError('Project', id);
			
			return updated as Project;
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	},

	async delete(id) {
		try {
			const supabase = await createServerSupabaseClient();
			const { error } = await supabase
				.from('projects')
				.delete()
				.eq('projectId', id);
				
			if (error) throw new DataAccessError(`Supabase error: ${error.message}`, 500, error);
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	},
	
	// Batch operations for improved performance
	async getAllByIds(ids: string[]): Promise<Project[]> {
		if (!ids.length) return [];
		
		try {
			const supabase = await createServerSupabaseClient();
			const { data, error } = await supabase
				.from('projects')
				.select('*')
				.in('projectId', ids)
				.order('createdAt', { ascending: false });
				
			if (error) throw new DataAccessError(`Supabase error: ${error.message}`, 500, error);
			return data as Project[];
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to fetch projects by ids: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	},
	
	async batchCreate(projects: Partial<Project>[]): Promise<Project[]> {
		if (!projects.length) return [];
		
		try {
			const supabase = await createServerSupabaseClient();
			const { data, error } = await supabase
				.from('projects')
				.insert(projects)
				.select();
				
			if (error) throw new DataAccessError(`Supabase error: ${error.message}`, 500, error);
			return data as Project[];
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to batch create projects: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	},
	
	async batchUpdate(updates: Array<{ id: string; data: Partial<Project> }>): Promise<Project[]> {
		if (!updates.length) return [];
		
		// For Supabase, we need to handle each update individually
		// but we can parallelize the requests
		try {
			const updatePromises = updates.map(async ({ id, data }) => {
				return this.update(id, data);
			});
			
			return await Promise.all(updatePromises);
		} catch (error) {
			if (error instanceof DataAccessError) throw error;
			throw new DataAccessError(`Failed to batch update projects: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
		}
	}
};