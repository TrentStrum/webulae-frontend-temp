import { apiClient } from '@/app/lib/apiClient';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { Project } from '@/app/types';

export class ProjectDataAccess implements DataAccessInterface<Project> {
	private readonly baseUrl = '/project';

	async getById(id: string): Promise<Project> {
		return apiClient.get<Project>(`${this.baseUrl}/${id}`);
	}

	async getAll(): Promise<Project[]> {
		return apiClient.get<Project[]>(this.baseUrl);
	}

	async create(data: Partial<Project>): Promise<Project> {
		return apiClient.post<Partial<Project>, Project>(this.baseUrl, data);
	}

	async update(id: string, data: Partial<Project>): Promise<Project> {
		return apiClient.put<Project>(`${this.baseUrl}/${id}`, data);
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${this.baseUrl}/${id}`);
	}
} 
