import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  organizationName: z.string().min(1, 'Organization name is required').optional(),
  phoneNumber: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  metadata: z.record(z.any()).optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>; 
