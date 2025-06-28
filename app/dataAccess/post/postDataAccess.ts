import { apiClient } from '@/app/lib/apiClient';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { Post } from '@/app/types';

export class PostDataAccess implements DataAccessInterface<Post> {
  private readonly baseUrl = '/post';

  async getById(id: string): Promise<Post> {
    return apiClient.get<Post>(`${this.baseUrl}/${id}`);
  }

  async getBySlug(slug: string): Promise<Post> {
    return apiClient.get<Post>(`${this.baseUrl}/slug/${slug}`);
  }

  async getAll(): Promise<Post[]> {
    return apiClient.get<Post[]>(this.baseUrl);
  }

  async getPublished(): Promise<Post[]> {
    return apiClient.get<Post[]>(`${this.baseUrl}/published`);
  }

  async create(data: Partial<Post>): Promise<Post> {
    return apiClient.post<Partial<Post>, Post>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    return apiClient.put<Post>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
