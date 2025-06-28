import { apiClient } from '@/app/lib/apiClient';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { PaymentMethod } from '@/app/types';

export class PaymentMethodDataAccess implements DataAccessInterface<PaymentMethod> {
    private readonly baseUrl = '/payment-method';

    async getById(id: string): Promise<PaymentMethod> {
        return apiClient.get<PaymentMethod>(`${this.baseUrl}/${id}`);
    }

    async getAll(): Promise<PaymentMethod[]> {
        return apiClient.get<PaymentMethod[]>(this.baseUrl);
    }

    async create(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
        return apiClient.post<Partial<PaymentMethod>, PaymentMethod>(this.baseUrl, data);
    }

    async update(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
        return apiClient.put<PaymentMethod>(`${this.baseUrl}/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }
}
