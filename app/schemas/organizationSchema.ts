import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name must be under 100 characters'),
  slug: z.string().min(1, 'Organization slug is required').max(50, 'Organization slug must be under 50 characters').optional(),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  industry: z.string().max(100, 'Industry must be under 100 characters').optional(),
  website: z.string().url('Website must be a valid URL').optional().or(z.literal('')),
});

export const organizationMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Role must be admin, member, or viewer' }),
  }),
});

export const updateOrganizationMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Role must be admin, member, or viewer' }),
  }).optional(),
  isActive: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;
export type OrganizationMemberSchema = z.infer<typeof organizationMemberSchema>;
export type UpdateOrganizationMemberSchema = z.infer<typeof updateOrganizationMemberSchema>; 