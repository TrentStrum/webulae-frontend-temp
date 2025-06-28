export type PolicySection = 
  | 'purpose'
  | 'scope'
  | 'definitions'
  | 'policy_statement'
  | 'procedures'
  | 'responsibilities'
  | 'compliance'
  | 'exceptions'
  | 'effective_date'
  | 'review_schedule';

export type PolicyTemplate = 
  | 'pto_policy'
  | 'equipment_checkout'
  | 'onboarding'
  | 'expense_reimbursement'
  | 'remote_work'
  | 'dress_code'
  | 'social_media'
  | 'confidentiality'
  | 'custom';

export interface PolicySectionContent {
  section: PolicySection;
  title: string;
  content: string;
  required: boolean;
  order: number;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: PolicySection[];
  defaultContent: Record<PolicySection, string>;
  variables: PolicyVariable[];
  legalLanguage: boolean;
  requiresReview: boolean;
}

export interface PolicyVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  label: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select type
  placeholder?: string;
}

export interface PolicyGenerationRequest {
  template: PolicyTemplate;
  organizationId: string;
  variables: Record<string, any>;
  includeLegalLanguage: boolean;
  customSections?: PolicySectionContent[];
  tone: 'formal' | 'professional' | 'friendly';
  language: 'en' | 'es' | 'fr';
}

export interface PolicyGenerationResponse {
  policyId: string;
  title: string;
  sections: PolicySectionContent[];
  metadata: {
    generatedAt: string;
    template: string;
    organizationId: string;
    version: string;
    wordCount: number;
  };
  legalDisclaimer?: string;
  reviewNotes?: string[];
}

export interface PolicyDocument {
  id: string;
  organizationId: string;
  title: string;
  template: PolicyTemplate;
  sections: PolicySectionContent[];
  status: 'draft' | 'review' | 'approved' | 'archived';
  version: string;
  generatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  reviewNotes?: string[];
  metadata: {
    wordCount: number;
    lastModified: string;
    createdBy: string;
  };
}

export interface PolicyBotSettings {
  organizationId: string;
  defaultTone: 'formal' | 'professional' | 'friendly';
  defaultLanguage: 'en' | 'es' | 'fr';
  includeLegalLanguage: boolean;
  requireReview: boolean;
  autoVersioning: boolean;
  allowedTemplates: PolicyTemplate[];
  customTemplates: PolicyTemplate[];
  complianceStandards: string[];
  legalDisclaimer: string;
} 