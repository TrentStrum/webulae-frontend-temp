import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { PaymentMethod } from '@/app/types';

const mockPaymentMethods: PaymentMethod[] = [];

export const paymentMethodMockDataAccess: DataAccessInterface<PaymentMethod> = {
    async getById(id) {
        const pm = mockPaymentMethods.find((p) => p.id === id);
        if (!pm) throw new Error('Payment method not found');
        return pm;
    },

    async getAll() {
        return mockPaymentMethods;
    },

    async create(data) {
        const newPM: PaymentMethod = {
            id: `mock_${Date.now()}`,
            userId: data.userId ?? '',
            stripePaymentMethodId: data.stripePaymentMethodId ?? '',
            type: data.type,
            last4: data.last4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockPaymentMethods.push(newPM);
        return newPM;
    },

    async update(id, data) {
        const index = mockPaymentMethods.findIndex((p) => p.id === id);
        if (index === -1) throw new Error('Payment method not found');
        const updated = {
            ...mockPaymentMethods[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        mockPaymentMethods[index] = updated;
        return updated;
    },

    async delete(id) {
        const index = mockPaymentMethods.findIndex((p) => p.id === id);
        if (index !== -1) mockPaymentMethods.splice(index, 1);
    },
};
