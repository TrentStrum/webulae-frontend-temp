export interface SystemPrompt {
  id: string;
  prompt_name: string;
  content: string;
  category: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Advanced features
  variables?: PromptVariable[];
  conditions?: PromptCondition[];
  template_type?: 'static' | 'dynamic' | 'conditional';
  version?: number;
  tags?: string[];
  usage_count?: number;
  last_used?: string;
}

export interface CreateSystemPromptRequest {
  prompt_name: string;
  content: string;
  category: string;
  priority?: number;
  is_active?: boolean;
  // Advanced features
  variables?: PromptVariable[];
  conditions?: PromptCondition[];
  template_type?: 'static' | 'dynamic' | 'conditional';
  tags?: string[];
}

export interface UpdateSystemPromptRequest {
  prompt_name?: string;
  content?: string;
  category?: string;
  priority?: number;
  is_active?: boolean;
  // Advanced features
  variables?: PromptVariable[];
  conditions?: PromptCondition[];
  template_type?: 'static' | 'dynamic' | 'conditional';
  tags?: string[];
}

// Advanced prompt features
export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  default_value?: any;
  required: boolean;
  validation?: VariableValidation;
}

export interface VariableValidation {
  min_length?: number;
  max_length?: number;
  pattern?: string;
  enum?: any[];
  custom_validator?: string; // JavaScript function as string
}

export interface PromptCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: PromptVariable[];
  examples: PromptExample[];
  tags: string[];
  usage_count: number;
  rating: number;
}

export interface PromptExample {
  input: Record<string, any>;
  output: string;
  description: string;
}

// Enhanced categories for advanced prompts
export const ADVANCED_SYSTEM_PROMPT_CATEGORIES = [
  'Bot Identity',
  'Personality & Tone',
  'Response Style',
  'Knowledge & Context',
  'Behavior & Rules',
  'Conditional Logic',
  'Dynamic Content',
  'Specialized Tasks',
  'Industry Specific',
  'Custom Templates'
] as const;

export type AdvancedSystemPromptCategory = typeof ADVANCED_SYSTEM_PROMPT_CATEGORIES[number];

// Prompt analytics
export interface PromptAnalytics {
  prompt_id: string;
  usage_count: number;
  average_response_time: number;
  user_satisfaction_score: number;
  success_rate: number;
  common_failures: string[];
  last_used: string;
  performance_metrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  token_usage: number;
  response_quality_score: number;
  context_relevance_score: number;
  user_feedback_score: number;
}

// Prompt testing
export interface PromptTest {
  id: string;
  prompt_id: string;
  test_input: string;
  expected_output: string;
  actual_output?: string;
  passed: boolean;
  execution_time: number;
  created_at: string;
}

// Prompt versioning
export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: number;
  content: string;
  variables: PromptVariable[];
  conditions: PromptCondition[];
  changes: string;
  created_at: string;
  created_by: string;
}

// Company system prompt types (extended)
export interface CompanySystemPrompt extends SystemPrompt {
  is_global: boolean;
  applies_to_roles: string[];
  applies_to_organizations: string[];
  seasonal_active?: boolean;
  seasonal_start?: string;
  seasonal_end?: string;
}

// Organization system prompt types (extended)
export interface OrganizationSystemPrompt extends SystemPrompt {
  organization_id: string;
  applies_to_roles: string[];
  department_specific?: boolean;
  department_id?: string;
  user_specific?: boolean;
  user_ids?: string[];
} 