import type { AccessRequestDataAccessInterface } from '@/app/contracts/DataAccess';
import type { AccessRequest, AccessRequestListParams } from '@/app/types/accessRequest.types';

// Mock data storage
const mockAccessRequests: AccessRequest[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    companyName: 'Tech Corp',
    jobTitle: 'CTO',
    useCase: 'We want to automate our customer onboarding process and create AI-powered support workflows.',
    teamSize: '26-100',
    industry: 'Technology',
    expectedStartDate: '2024-02-01',
    additionalInfo: 'We have a team of 50 developers and need to scale our operations.',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@healthcare.com',
    companyName: 'HealthCare Plus',
    jobTitle: 'Operations Manager',
    useCase: 'Looking to streamline patient intake processes and automate appointment scheduling.',
    teamSize: '6-25',
    industry: 'Healthcare',
    expectedStartDate: '2024-01-20',
    additionalInfo: 'We operate 3 clinics and need to standardize our processes.',
    status: 'approved',
    submittedAt: '2024-01-10T14:20:00Z',
    reviewedAt: '2024-01-12T09:15:00Z',
    reviewedBy: 'admin@webulae.com',
    adminNotes: 'Approved - Good fit for healthcare automation use case.',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@retail.com',
    companyName: 'Retail Solutions',
    jobTitle: 'Store Manager',
    useCase: 'Need to automate inventory management and customer feedback processing.',
    teamSize: '1-5',
    industry: 'Retail',
    expectedStartDate: '2024-02-15',
    status: 'rejected',
    submittedAt: '2024-01-08T16:45:00Z',
    reviewedAt: '2024-01-09T11:30:00Z',
    reviewedBy: 'admin@webulae.com',
    adminNotes: 'Rejected - Team size too small for current pricing model.',
  },
];

export const accessRequestMockDataAccess: AccessRequestDataAccessInterface<AccessRequest> = {
  async getById(id: string): Promise<AccessRequest> {
    const request = mockAccessRequests.find(r => r.id === id);
    if (!request) {
      throw new Error(`Access request with id ${id} not found`);
    }
    return request;
  },

  async getAll(): Promise<AccessRequest[]> {
    return [...mockAccessRequests];
  },

  async create(data: Partial<AccessRequest>): Promise<AccessRequest> {
    const newRequest: AccessRequest = {
      id: (mockAccessRequests.length + 1).toString(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      companyName: data.companyName || '',
      jobTitle: data.jobTitle || '',
      useCase: data.useCase || '',
      teamSize: data.teamSize || '1-5',
      industry: data.industry || '',
      expectedStartDate: data.expectedStartDate || '',
      additionalInfo: data.additionalInfo,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      ...data,
    };
    
    mockAccessRequests.push(newRequest);
    return newRequest;
  },

  async update(id: string, data: Partial<AccessRequest>): Promise<AccessRequest> {
    const index = mockAccessRequests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Access request with id ${id} not found`);
    }
    
    mockAccessRequests[index] = { ...mockAccessRequests[index], ...data };
    return mockAccessRequests[index];
  },

  async delete(id: string): Promise<void> {
    const index = mockAccessRequests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Access request with id ${id} not found`);
    }
    
    mockAccessRequests.splice(index, 1);
  },

  // Custom methods
  async list(params?: AccessRequestListParams): Promise<AccessRequest[]> {
    let filtered = [...mockAccessRequests];
    
    if (params?.status) {
      filtered = filtered.filter(r => r.status === params.status);
    }
    
    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }
    
    if (params?.offset) {
      filtered = filtered.slice(params.offset);
    }
    
    return filtered;
  },

  async approve(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return this.update(id, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  },

  async reject(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return this.update(id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  },
}; 