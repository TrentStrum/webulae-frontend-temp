import { PolicyTemplate, PolicySection, PolicyVariable } from '@/app/types/policyBot.types';

export const POLICY_TEMPLATES: Record<string, PolicyTemplate> = {
  pto_policy: {
    id: 'pto_policy',
    name: 'Paid Time Off (PTO) Policy',
    description: 'Comprehensive PTO policy covering vacation, sick leave, and personal time',
    category: 'Human Resources',
    sections: ['purpose', 'scope', 'definitions', 'policy_statement', 'procedures', 'responsibilities', 'exceptions', 'effective_date'],
    defaultContent: {
      purpose: 'This policy establishes guidelines for paid time off (PTO) to ensure fair and consistent treatment of all employees while maintaining operational efficiency.',
      scope: 'This policy applies to all full-time and part-time employees of [Company Name].',
      definitions: 'PTO: Paid Time Off\nAccrual: The gradual accumulation of PTO hours\nRequest: Formal submission for time off approval',
      policy_statement: '[Company Name] provides paid time off to eligible employees for vacation, personal time, and illness.',
      procedures: '1. Submit PTO request at least [notice_period] days in advance\n2. Obtain manager approval\n3. Update time tracking system\n4. Ensure coverage for responsibilities',
      responsibilities: 'Employees: Submit timely requests and ensure coverage\nManagers: Review and approve requests fairly\nHR: Track and maintain PTO records',
      exceptions: 'Emergency situations may require immediate time off with manager approval.',
      effective_date: 'This policy is effective as of [effective_date] and supersedes all previous PTO policies.',
      compliance: '',
      review_schedule: 'This policy will be reviewed annually and updated as needed.'
    },
    variables: [
      {
        name: 'company_name',
        type: 'text',
        label: 'Company Name',
        description: 'The name of your organization',
        required: true,
        placeholder: 'Enter company name'
      },
      {
        name: 'pto_days',
        type: 'number',
        label: 'Annual PTO Days',
        description: 'Number of PTO days provided annually',
        required: true,
        defaultValue: 15
      },
      {
        name: 'notice_period',
        type: 'number',
        label: 'Notice Period (Days)',
        description: 'Required notice period for PTO requests',
        required: true,
        defaultValue: 14
      },
      {
        name: 'accrual_rate',
        type: 'select',
        label: 'Accrual Rate',
        description: 'How PTO is accrued',
        required: true,
        options: ['Monthly', 'Bi-weekly', 'Quarterly'],
        defaultValue: 'Monthly'
      },
      {
        name: 'carryover_limit',
        type: 'number',
        label: 'Carryover Limit',
        description: 'Maximum PTO days that can be carried to next year',
        required: false,
        defaultValue: 5
      }
    ],
    legalLanguage: true,
    requiresReview: true
  },

  equipment_checkout: {
    id: 'equipment_checkout',
    name: 'Equipment Checkout Policy',
    description: 'Policy for checking out company equipment and devices',
    category: 'IT & Operations',
    sections: ['purpose', 'scope', 'definitions', 'policy_statement', 'procedures', 'responsibilities', 'compliance', 'exceptions', 'effective_date'],
    defaultContent: {
      purpose: 'This policy establishes procedures for the checkout and return of company equipment to ensure proper tracking, maintenance, and security.',
      scope: 'This policy applies to all employees who need to use company equipment for work purposes.',
      definitions: 'Equipment: Any company-owned device, tool, or asset\nCheckout: The process of borrowing equipment\nReturn: The process of returning equipment',
      policy_statement: '[Company Name] provides necessary equipment to employees for work-related activities under specific guidelines.',
      procedures: '1. Submit equipment request through [request_system]\n2. Obtain manager approval\n3. Sign equipment checkout form\n4. Return equipment in original condition\n5. Report any damage or issues immediately',
      responsibilities: 'Employees: Care for equipment and report issues\nIT: Maintain equipment inventory and condition\nManagers: Approve equipment requests',
      compliance: 'All equipment must be returned within [return_period] days unless extended approval is granted.',
      exceptions: 'Emergency situations may require immediate equipment checkout with post-approval.',
      effective_date: 'This policy is effective as of [effective_date].',
      review_schedule: 'This policy will be reviewed quarterly.'
    },
    variables: [
      {
        name: 'company_name',
        type: 'text',
        label: 'Company Name',
        description: 'The name of your organization',
        required: true,
        placeholder: 'Enter company name'
      },
      {
        name: 'request_system',
        type: 'text',
        label: 'Request System',
        description: 'System used for equipment requests',
        required: true,
        placeholder: 'e.g., IT Help Desk, Online Portal'
      },
      {
        name: 'return_period',
        type: 'number',
        label: 'Return Period (Days)',
        description: 'Maximum time equipment can be checked out',
        required: true,
        defaultValue: 30
      },
      {
        name: 'requires_deposit',
        type: 'boolean',
        label: 'Requires Deposit',
        description: 'Whether a deposit is required for equipment checkout',
        required: true,
        defaultValue: false
      }
    ],
    legalLanguage: true,
    requiresReview: false
  },

  onboarding: {
    id: 'onboarding',
    name: 'Employee Onboarding Policy',
    description: 'Comprehensive onboarding process for new employees',
    category: 'Human Resources',
    sections: ['purpose', 'scope', 'definitions', 'policy_statement', 'procedures', 'responsibilities', 'effective_date'],
    defaultContent: {
      purpose: 'This policy establishes a structured onboarding process to ensure new employees are properly integrated into the organization.',
      scope: 'This policy applies to all new employees joining [Company Name].',
      definitions: 'Onboarding: The process of integrating new employees\nOrientation: Initial company introduction\nTraining: Job-specific skill development',
      policy_statement: '[Company Name] provides a comprehensive onboarding program to support new employee success.',
      procedures: '1. Pre-arrival preparation and welcome package\n2. Day 1 orientation and introductions\n3. Week 1 training and system access\n4. Month 1 performance review and feedback\n5. Month 3 comprehensive evaluation',
      responsibilities: 'HR: Coordinate onboarding process\nManagers: Provide job-specific training\nIT: Set up system access\nNew Employee: Complete required training',
      effective_date: 'This policy is effective as of [effective_date].',
      review_schedule: 'This policy will be reviewed annually.',
      compliance: '',
      exceptions: ''
    },
    variables: [
      {
        name: 'company_name',
        type: 'text',
        label: 'Company Name',
        description: 'The name of your organization',
        required: true,
        placeholder: 'Enter company name'
      },
      {
        name: 'onboarding_duration',
        type: 'number',
        label: 'Onboarding Duration (Weeks)',
        description: 'Length of the onboarding process',
        required: true,
        defaultValue: 4
      },
      {
        name: 'probation_period',
        type: 'number',
        label: 'Probation Period (Months)',
        description: 'Length of probation period',
        required: true,
        defaultValue: 3
      }
    ],
    legalLanguage: false,
    requiresReview: true
  }
};

export const getPolicyTemplate = (templateId: string): PolicyTemplate | null => {
  return POLICY_TEMPLATES[templateId] || null;
};

export const getAllPolicyTemplates = (): PolicyTemplate[] => {
  return Object.values(POLICY_TEMPLATES);
};

export const getPolicyTemplatesByCategory = (category: string): PolicyTemplate[] => {
  return Object.values(POLICY_TEMPLATES).filter(template => template.category === category);
}; 