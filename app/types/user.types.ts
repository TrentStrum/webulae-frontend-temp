export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationName?: string;
  companyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organizationName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationUser extends User {
  organizationId: string;
  organizationRole: 'admin' | 'member' | 'viewer';
  isPrimary: boolean;
}