import { N8nWorkflow, N8nWorkflowExecution, N8nWorkflowExecutionRequest, N8nWorkflowExecutionResponse } from '@/app/types/n8n.types';

export class N8nClient {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': this.apiKey,
    };
  }

  /**
   * Test the connection to n8n
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: this.headers,
      });
      return response.ok;
    } catch (error) {
      console.error('n8n connection test failed:', error);
      return false;
    }
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${id}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow ${id}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string, 
    executionRequest: Partial<N8nWorkflowExecutionRequest> = {}
  ): Promise<N8nWorkflowExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        mode: 'manual',
        ...executionRequest,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to execute workflow: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<N8nWorkflowExecution> {
    const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch execution ${executionId}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get recent executions for a workflow
   */
  async getWorkflowExecutions(workflowId: string, limit: number = 10): Promise<N8nWorkflowExecution[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/executions?workflowId=${workflowId}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch executions for workflow ${workflowId}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to activate workflow ${workflowId}: ${response.statusText}`);
    }
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/deactivate`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate workflow ${workflowId}: ${response.statusText}`);
    }
  }

  /**
   * Create a webhook for a workflow
   */
  async createWebhook(workflowId: string, webhookPath: string): Promise<{ webhookUrl: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/webhooks`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        path: webhookPath,
        httpMethod: 'POST',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create webhook for workflow ${workflowId}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      webhookUrl: `${this.baseUrl}/webhook/${data.webhookId}`,
    };
  }

  /**
   * Get webhook information
   */
  async getWebhooks(workflowId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/webhooks`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch webhooks for workflow ${workflowId}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }
} 