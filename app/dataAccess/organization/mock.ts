import type { OrganizationMember, OrganizationInvite, Organization, OrganizationRole } from '@/app/types/organization.types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { DataAccessError, NotFoundError } from '@/app/lib/dataAccess';
import { randomUUID } from 'crypto';

// In-memory storage for mock data
const businesses: Organization[] = [];
const businessMembers: OrganizationMember[] = [];
const businessInvites: OrganizationInvite[] = [];

export const businessMockDataAccess: DataAccessInterface<Organization> & {
  getBusinessesByUserId(userId: string): Promise<Organization[]>;
  getBusinessByPrimaryAdmin(userId: string): Promise<Organization | null>;
} = {
  async getById(id: string): Promise<Organization> {
    const business = businesses.find(b => b.id === id);
    if (!business) throw new NotFoundError('Business', id);
    return business;
  },

  async getAll(): Promise<Organization[]> {
    return [...businesses];
  },

  async create(data: Partial<Organization>): Promise<Organization> {
    const id = `bus_${randomUUID()}`;
    
    const newBusiness: Organization = {
      id,
      name: data.name ?? '',
      description: data.description,
      imageUrl: data.imageUrl,
      website: data.website,
      industry: data.industry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    businesses.push(newBusiness);
    return newBusiness;
  },

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    const index = businesses.findIndex(b => b.id === id);
    if (index === -1) throw new NotFoundError('Business', id);
    
    const updatedBusiness = {
      ...businesses[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    businesses[index] = updatedBusiness;
    return updatedBusiness;
  },

  async delete(id: string): Promise<void> {
    const index = businesses.findIndex(b => b.id === id);
    if (index !== -1) {
      businesses.splice(index, 1);
      
      // Also remove all members and invites for this business
      const memberIndices = businessMembers.filter(m => m.organizationId === id).map(m => businessMembers.indexOf(m));
      for (let i = memberIndices.length - 1; i >= 0; i--) {
        businessMembers.splice(memberIndices[i], 1);
      }
      
      const inviteIndices = businessInvites.filter(i => i.organizationId === id).map(i => businessInvites.indexOf(i));
      for (let i = inviteIndices.length - 1; i >= 0; i--) {
        businessInvites.splice(inviteIndices[i], 1);
      }
    }
  },

  async getBusinessesByUserId(userId: string): Promise<Organization[]> {
    const memberBusinessIds = businessMembers
      .filter(m => m.userId === userId && m.isActive)
      .map(m => m.organizationId);
    
    return businesses.filter(b => memberBusinessIds.includes(b.id));
  },

  async getBusinessByPrimaryAdmin(userId: string): Promise<Organization | null> {
    const primaryMember = businessMembers.find(
      m => m.userId === userId && m.isPrimary && m.role === 'admin' && m.isActive
    );
    
    if (!primaryMember) return null;
    
    const business = businesses.find(b => b.id === primaryMember.organizationId);
    return business || null;
  }
};

export const businessMemberMockDataAccess = {
  async getMemberById(id: string): Promise<OrganizationMember> {
    const member = businessMembers.find(m => m.id === id);
    if (!member) throw new NotFoundError('BusinessMember', id);
    return member;
  },

  async getMembersByBusinessId(businessId: string): Promise<OrganizationMember[]> {
    return businessMembers.filter(m => m.organizationId === businessId);
  },

  async getMemberByBusinessAndUser(businessId: string, userId: string): Promise<OrganizationMember | null> {
    return businessMembers.find(m => m.organizationId === businessId && m.userId === userId) || null;
  },

  async addMember(businessId: string, userId: string, role: string, isPrimary: boolean = false): Promise<OrganizationMember> {
    // Check if the member already exists
    const existingMember = businessMembers.find(m => m.organizationId === businessId && m.userId === userId);
    if (existingMember) {
      throw new DataAccessError(`User is already a member of this business`, 400);
    }
        
    // If setting as primary, unset any other primary members for this business
    if (isPrimary) {
      businessMembers.forEach(m => {
        if (m.organizationId === businessId && m.isPrimary) {
          m.isPrimary = false;
        }
      });
    }
    
    const newMember: OrganizationMember = {
      id: `bm_${randomUUID()}`,
      organizationId: businessId,
      userId,
      role: role as OrganizationRole,
      isActive: true,
      isPrimary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    businessMembers.push(newMember);
    return newMember;
  },

  async updateMember(id: string, data: Partial<OrganizationMember>): Promise<OrganizationMember> {
    const index = businessMembers.findIndex(m => m.id === id);
    if (index === -1) throw new NotFoundError('BusinessMember', id);
    
    const now = new Date().toISOString();
    
    // If setting as primary, unset any other primary members for this business
    if (data.isPrimary) {
      const businessId = businessMembers[index].organizationId;
      businessMembers.forEach(m => {
        if (m.organizationId === businessId && m.id !== id && m.isPrimary) {
          m.isPrimary = false;
        }
      });
    }
    
    const updatedMember = {
      ...businessMembers[index],
      ...data,
      updatedAt: now
    };
    
    businessMembers[index] = updatedMember;
    return updatedMember;
  },

  async removeMember(id: string): Promise<void> {
    const index = businessMembers.findIndex(m => m.id === id);
    if (index === -1) return;
    
    // Check if this is a primary admin
    if (businessMembers[index].isPrimary && businessMembers[index].role === 'admin') {
      throw new DataAccessError(`Cannot remove the primary admin`, 400);
    }
    
    businessMembers.splice(index, 1);
  },

  async getBusinessRoleForUser(businessId: string, userId: string): Promise<string | null> {
    const member = businessMembers.find(
      m => m.organizationId === businessId && m.userId === userId && m.isActive
    );
    
    return member ? member.role : null;
  },

  async isPrimaryAdmin(businessId: string, userId: string): Promise<boolean> {
    const member = businessMembers.find(
      m => m.organizationId === businessId && m.userId === userId && m.role === 'admin' && m.isActive
    );
    
    return member ? member.isPrimary : false;
  }
};

export const businessInviteMockDataAccess = {
  async getInviteById(id: string): Promise<OrganizationInvite> {
    const invite = businessInvites.find(i => i.id === id);
    if (!invite) throw new NotFoundError('BusinessInvite', id);
    return invite;
  },

  async getInvitesByBusinessId(businessId: string): Promise<OrganizationInvite[]> {
    return businessInvites.filter(i => i.organizationId === businessId);
  },

  async getInviteByToken(token: string): Promise<OrganizationInvite | null> {
    const invite = businessInvites.find(i => i.token === token);
    return invite || null;
  },

  async getInviteByEmail(businessId: string, email: string): Promise<OrganizationInvite | null> {
    const invite = businessInvites.find(i => i.organizationId === businessId && i.email === email);
    return invite || null;
  },

  async createInvite(businessId: string, email: string, role: string): Promise<OrganizationInvite> {
    // Check if an invite already exists for this email
    const existingInvite = businessInvites.find(i => i.organizationId === businessId && i.email === email);
    if (existingInvite) {
      throw new DataAccessError(`An invite already exists for this email`, 400);
    }
    
    const newInvite: OrganizationInvite = {
      id: `inv_${randomUUID()}`,
      organizationId: businessId,
      email,
      role: role as OrganizationRole,
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    businessInvites.push(newInvite);
    return newInvite;
  },

  async deleteInvite(id: string): Promise<void> {
    const index = businessInvites.findIndex(i => i.id === id);
    if (index !== -1) {
      businessInvites.splice(index, 1);
    }
  },

  async deleteInviteByToken(token: string): Promise<void> {
    const index = businessInvites.findIndex(i => i.token === token);
    if (index !== -1) {
      businessInvites.splice(index, 1);
    }
  }
};