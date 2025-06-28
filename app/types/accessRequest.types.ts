export interface AccessRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  jobTitle: string;
  useCase: string;
  teamSize: '1-5' | '6-25' | '26-100' | '100+';
  industry: string;
  expectedStartDate: string;
  additionalInfo?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
}

export interface AccessRequestListParams {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}

export interface AccessRequestCreateData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  jobTitle: string;
  useCase: string;
  teamSize: '1-5' | '6-25' | '26-100' | '100+';
  industry: string;
  expectedStartDate: string;
  additionalInfo?: string;
}

export interface AccessRequestUpdateData {
  status?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
} 