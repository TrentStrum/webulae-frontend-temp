import { apiClient } from '@/app/lib/apiClient';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { AccessRequest, AccessRequestListParams, AccessRequestCreateData, AccessRequestUpdateData } from '@/app/types/accessRequest.types';

export class AccessRequestDataAccess implements DataAccessInterface<AccessRequest> {
  private readonly baseUrl = '/access-request';

  async getById(id: string): Promise<AccessRequest> {
    return apiClient.get<AccessRequest>(`${this.baseUrl}/${id}`);
  }

  async getAll(): Promise<AccessRequest[]> {
    return apiClient.get<AccessRequest[]>(this.baseUrl);
  }

  async create(data: Partial<AccessRequest>): Promise<AccessRequest> {
    return apiClient.post<Partial<AccessRequest>, AccessRequest>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<AccessRequest>): Promise<AccessRequest> {
    return apiClient.put<AccessRequest>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Custom methods for access requests
  async list(params?: AccessRequestListParams): Promise<AccessRequest[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams}` : this.baseUrl;
    return apiClient.get<AccessRequest[]>(url);
  }

  async approve(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return apiClient.put<AccessRequest>(`${this.baseUrl}/${id}/approve`, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  }

  async reject(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return apiClient.put<AccessRequest>(`${this.baseUrl}/${id}/reject`, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  }
} 