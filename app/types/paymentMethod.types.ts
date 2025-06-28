export type PaymentMethod = {
    id: string;
    userId: string;
    stripePaymentMethodId: string;
    type?: string;
    last4?: string;
    createdAt?: string;
    updatedAt?: string;
};
