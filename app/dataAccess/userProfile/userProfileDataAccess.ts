import { apiClient } from '@/app/lib/apiClient';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { UserProfile } from '@/app/types';

export class UserProfileDataAccess implements DataAccessInterface<UserProfile> {
	private readonly baseUrl = '/user-profile';

	async getById(id: string): Promise<UserProfile> {
		return apiClient.get<UserProfile>(`${this.baseUrl}/${id}`);
	}

	async getAll(): Promise<UserProfile[]> {
		return apiClient.get<UserProfile[]>(this.baseUrl);
	}

	async create(data: Partial<UserProfile>): Promise<UserProfile> {
		return apiClient.post<Partial<UserProfile>, UserProfile>(this.baseUrl, data);
	}

	async update(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
		return apiClient.put<UserProfile>(`${this.baseUrl}/${id}`, data);
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${this.baseUrl}/${id}`);
	}
}
