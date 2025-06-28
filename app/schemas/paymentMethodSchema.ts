import { z } from 'zod';

export const paymentMethodSchema = z.object({
    userId: z.string().min(1, 'userId required'),
    stripePaymentMethodId: z.string().min(1, 'stripePaymentMethodId required'),
    type: z.string().optional(),
    last4: z.string().optional(),
});

export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;
