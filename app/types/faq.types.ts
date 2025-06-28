export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  priority?: number;
  is_active?: boolean;
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  category?: string;
  tags?: string[];
  priority?: number;
  is_active?: boolean;
}

export interface OrganizationFAQ extends FAQ {
  organization_id: string;
}

export interface CompanyFAQ extends FAQ {
  // No additional fields needed for company FAQs
}

export const FAQ_CATEGORIES = [
  'General',
  'Technical',
  'Support',
  'Training',
  'Product',
  'Billing',
  'Security',
  'Integration'
] as const;

export type FAQCategory = typeof FAQ_CATEGORIES[number]; 