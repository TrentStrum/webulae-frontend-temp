import { User } from './user.types';

export type OrganizationRole = 'admin' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
  description?: string;
  industry?: string;
  website?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  description?: string;
  industry?: string;
  website?: string;
  imageUrl?: string;
}

export interface AddOrganizationMemberInput {
  email: string;
  role: OrganizationRole;
}

export interface UpdateOrganizationMemberInput {
  role?: OrganizationRole;
  isActive?: boolean;
  isPrimary?: boolean;
} 