export interface N8nWorkflow {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  tags: string[];
  nodes: N8nNode[];
  connections: Record<string, any>;
  settings: N8nWorkflowSettings;
  versionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface N8nWorkflowSettings {
  saveExecutionProgress: boolean;
  saveManualExecutions: boolean;
  callerPolicy: string;
  errorWorkflow?: string;
}

export interface N8nWorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  finishedAt?: string;
  data: any[];
  error?: string;
  mode: 'manual' | 'trigger' | 'webhook';
  retryOf?: string;
  retrySuccessId?: string;
}

export interface N8nWorkflowExecutionRequest {
  workflowId: string;
  data?: any[];
  pinData?: Record<string, any>;
  startNodes?: string[];
  destinationNode?: string;
  runData?: Record<string, any>;
  pinData?: Record<string, any>;
  executionMode?: 'manual' | 'trigger' | 'webhook';
}

export interface N8nWorkflowExecutionResponse {
  executionId: string;
  status: 'running' | 'completed' | 'failed';
  data?: any[];
  error?: string;
}

export interface N8nWorkflowTrigger {
  id: string;
  workflowId: string;
  name: string;
  type: 'webhook' | 'schedule' | 'manual' | 'chat';
  config: Record<string, any>;
  active: boolean;
  createdAt: string;
}

export interface N8nChatTrigger {
  id: string;
  workflowId: string;
  triggerPhrases: string[];
  description: string;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  permissions: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface N8nWorkflowButton {
  id: string;
  workflowId: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  permissions: string[];
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface N8nWorkflowBubble {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
  workflows: N8nWorkflowButton[];
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface N8nOrganizationConfig {
  organization_id: string;
  n8n_base_url: string;
  n8n_api_key: string;
  webhook_secret?: string;
  allowed_workflows: string[];
  max_executions_per_minute: number;
  created_at: string;
  updated_at: string;
}

export interface N8nWorkflowPermission {
  workflow_id: string;
  organization_id: string;
  user_roles: string[];
  allowed_operations: ('execute' | 'view' | 'edit')[];
  created_at: string;
}

export interface ChatWorkflowSuggestion {
  type: 'workflow_button' | 'workflow_bubble' | 'workflow_category';
  title: string;
  description: string;
  icon?: string;
  color?: string;
  workflows: N8nWorkflowButton[];
  action: 'execute' | 'confirm' | 'select';
  data?: any;
} 