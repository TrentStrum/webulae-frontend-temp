import { z } from 'zod';

// Fields that admins are allowed to update
export const adminUserUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  organizationName: z.string().min(1, 'Organization is required').max(200, 'Organization name too long'),
  role: z.enum(['user', 'org_admin', 'org_member', 'global_admin']).optional(),
}).strict(); // Reject any unknown fields

// Fields that are NEVER allowed to be updated by admins
export const FORBIDDEN_FIELDS = [
  'password',
  'twoFactorEnabled',
  'emailVerified',
  'phoneNumber',
  'externalId',
  'createdAt',
  'updatedAt',
  'lastSignInAt',
  'publicMetadata',
  'privateMetadata',
  'unsafeMetadata',
] as const;

// Schema for creating new users
export const adminUserCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  organizationName: z.string().min(1, 'Organization is required').max(200, 'Organization name too long'),
  role: z.enum(['user', 'org_admin', 'org_member', 'global_admin']).default('user'),
}).strict();

// Type exports
export type AdminUserUpdateData = z.infer<typeof adminUserUpdateSchema>;
export type AdminUserCreateData = z.infer<typeof adminUserCreateSchema>;

// Utility function to filter out forbidden fields
export function filterSafeFields(data: any): AdminUserUpdateData {
  const safeData: any = {};
  
  Object.keys(data).forEach(key => {
    if (!FORBIDDEN_FIELDS.includes(key as any)) {
      safeData[key] = data[key];
    }
  });
  
  return adminUserUpdateSchema.parse(safeData);
} 