// Base Integration Types
export interface Integration {
  id: string;
  organizationId: string;
  name: string;
  type: IntegrationType;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config: IntegrationConfig;
  metadata: IntegrationMetadata;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
}

export type IntegrationType = 
  | 'database'
  | 'crm'
  | 'marketing'
  | 'project_management'
  | 'communication'
  | 'analytics'
  | 'ecommerce'
  | 'finance'
  | 'hr'
  | 'custom';

export type IntegrationProvider = 
  | 'airtable'
  | 'notion'
  | 'slack'
  | 'discord'
  | 'zapier'
  | 'make'
  | 'hubspot'
  | 'salesforce'
  | 'mailchimp'
  | 'stripe'
  | 'shopify'
  | 'quickbooks'
  | 'bamboo_hr'
  | 'google_workspace'
  | 'microsoft_365'
  | 'custom';

export type IntegrationStatus = 
  | 'active'
  | 'inactive'
  | 'error'
  | 'syncing'
  | 'disconnected';

export interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  baseUrl?: string;
  webhookUrl?: string;
  customFields?: Record<string, any>;
  [key: string]: any;
}

export interface IntegrationMetadata {
  version: string;
  capabilities: IntegrationCapability[];
  rateLimits?: RateLimitInfo;
  webhookSupport: boolean;
  realtimeSupport: boolean;
  dataTypes: string[];
  features: string[];
}

export interface IntegrationCapability {
  name: string;
  description: string;
  supported: boolean;
  requiresAuth: boolean;
  rateLimit?: string;
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  resetTime?: string;
}

// Integration Templates
export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  provider: IntegrationProvider;
  type: IntegrationType;
  category: string;
  icon: string;
  color: string;
  capabilities: IntegrationCapability[];
  setupSteps: SetupStep[];
  configSchema: ConfigSchema;
  examples: IntegrationExample[];
  popularity: number;
  rating: number;
  isOfficial: boolean;
  isBeta: boolean;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  type: 'api_key' | 'oauth' | 'webhook' | 'custom';
  required: boolean;
  validation?: ValidationRule[];
}

export interface ConfigSchema {
  type: 'object';
  properties: Record<string, ConfigProperty>;
  required: string[];
}

export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  title: string;
  description?: string;
  default?: any;
  enum?: any[];
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}

export interface IntegrationExample {
  name: string;
  description: string;
  config: IntegrationConfig;
  useCase: string;
}

// Integration Connections
export interface IntegrationConnection {
  id: string;
  integrationId: string;
  name: string;
  type: ConnectionType;
  status: ConnectionStatus;
  config: ConnectionConfig;
  metadata: ConnectionMetadata;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  errorCount: number;
  lastErrorAt?: string;
  lastErrorMessage?: string;
}

export type ConnectionType = 
  | 'webhook'
  | 'api'
  | 'oauth'
  | 'database'
  | 'file_sync'
  | 'real_time';

export type ConnectionStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'connecting'
  | 'disconnecting';

export interface ConnectionConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  authentication?: AuthConfig;
  triggers?: TriggerConfig[];
  filters?: FilterConfig[];
  transformations?: TransformationConfig[];
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api_key';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface TriggerConfig {
  event: string;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: any;
}

export interface TriggerAction {
  type: 'webhook' | 'api_call' | 'data_transform' | 'notification';
  config: any;
}

export interface FilterConfig {
  field: string;
  operator: 'include' | 'exclude' | 'transform';
  value: any;
}

export interface TransformationConfig {
  type: 'map' | 'filter' | 'aggregate' | 'format';
  config: any;
}

export interface ConnectionMetadata {
  responseTime: number;
  successRate: number;
  totalRequests: number;
  lastResponseTime?: number;
  averageResponseTime: number;
}

// Integration Workflows
export interface IntegrationWorkflow {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  config: WorkflowConfig;
  metadata: WorkflowMetadata;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
}

export type WorkflowStatus = 
  | 'active'
  | 'inactive'
  | 'draft'
  | 'error'
  | 'running';

export interface WorkflowTrigger {
  id: string;
  type: 'webhook' | 'schedule' | 'manual' | 'event';
  config: any;
  conditions?: TriggerCondition[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'api_call' | 'data_transform' | 'condition' | 'notification' | 'webhook';
  config: any;
  order: number;
  dependsOn?: string[];
  retryConfig?: RetryConfig;
}

export interface WorkflowConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  parallelExecution: boolean;
  errorHandling: 'stop' | 'continue' | 'retry';
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  maxDelay: number;
}

export interface WorkflowMetadata {
  averageExecutionTime: number;
  successRate: number;
  lastExecutionTime?: number;
  totalExecutions: number;
  averageResponseTime: number;
}

// Integration Analytics
export interface IntegrationAnalytics {
  integrationId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalDataTransferred: number;
    uniqueUsers: number;
    peakUsageTime: string;
    errorRate: number;
  };
  timeSeries: TimeSeriesData[];
  topEndpoints: EndpointUsage[];
  errorBreakdown: ErrorBreakdown[];
  performanceTrends: PerformanceTrend[];
}

export interface TimeSeriesData {
  timestamp: string;
  requests: number;
  responseTime: number;
  errors: number;
  dataTransferred: number;
}

export interface EndpointUsage {
  endpoint: string;
  requests: number;
  averageResponseTime: number;
  errorRate: number;
  lastUsed: string;
}

export interface ErrorBreakdown {
  errorType: string;
  count: number;
  percentage: number;
  lastOccurrence: string;
  commonCauses: string[];
}

export interface PerformanceTrend {
  metric: string;
  trend: 'improving' | 'declining' | 'stable';
  change: number;
  period: string;
}

// Integration Marketplace
export interface IntegrationMarketplace {
  categories: MarketplaceCategory[];
  featured: IntegrationTemplate[];
  popular: IntegrationTemplate[];
  recent: IntegrationTemplate[];
  searchResults: IntegrationTemplate[];
  filters: MarketplaceFilters;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  integrationCount: number;
  subcategories: string[];
}

export interface MarketplaceFilters {
  categories: string[];
  providers: IntegrationProvider[];
  types: IntegrationType[];
  features: string[];
  pricing: 'free' | 'paid' | 'both';
  rating: number;
  officialOnly: boolean;
}

// Integration Testing
export interface IntegrationTest {
  id: string;
  integrationId: string;
  name: string;
  type: TestType;
  config: TestConfig;
  results: TestResult[];
  status: TestStatus;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
}

export type TestType = 
  | 'connection'
  | 'authentication'
  | 'api_endpoint'
  | 'webhook'
  | 'data_sync'
  | 'workflow'
  | 'performance';

export interface TestConfig {
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  expectedResponse?: any;
  timeout: number;
  retries: number;
}

export interface TestResult {
  timestamp: string;
  success: boolean;
  responseTime: number;
  statusCode?: number;
  response?: any;
  error?: string;
  details?: Record<string, any>;
}

export type TestStatus = 
  | 'pending'
  | 'running'
  | 'passed'
  | 'failed'
  | 'timeout';

// Integration Events
export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  data: any;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type EventType = 
  | 'connection_lost'
  | 'authentication_failed'
  | 'rate_limit_exceeded'
  | 'api_error'
  | 'data_sync_failed'
  | 'webhook_failed'
  | 'workflow_error'
  | 'performance_degraded';

export type EventSeverity = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

// API Response Types
export interface IntegrationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    executionTime: number;
  };
}

export interface IntegrationListResponse {
  integrations: Integration[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IntegrationTestResponse {
  test: IntegrationTest;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
    averageResponseTime: number;
  };
} 