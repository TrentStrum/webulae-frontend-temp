import { N8nClient } from './client';
import { 
  getN8nOrganizationConfig, 
  findMatchingChatTriggers,
  getN8nWorkflowPermission 
} from '@/app/dataAccess/n8n/n8nDataAccess';
import { 
  N8nWorkflow, 
  N8nWorkflowExecutionResponse, 
  N8nChatTrigger,
  N8nWorkflowExecutionRequest 
} from '@/app/types/n8n.types';

export interface N8nExecutionResult {
  success: boolean;
  executionId?: string;
  data?: any[];
  error?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export class N8nService {
  private client: N8nClient | null = null;
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Initialize the n8n client with organization configuration
   */
  private async initializeClient(): Promise<void> {
    if (this.client) return;

    const config = await getN8nOrganizationConfig(this.organizationId);
    if (!config) {
      throw new Error('n8n configuration not found for this organization');
    }

    this.client = new N8nClient(config.n8n_base_url, config.n8n_api_key);
  }

  /**
   * Check if n8n is configured for this organization
   */
  async isConfigured(): Promise<boolean> {
    try {
      const config = await getN8nOrganizationConfig(this.organizationId);
      return !!config;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test the n8n connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.initializeClient();
      return await this.client!.testConnection();
    } catch (error) {
      console.error('n8n connection test failed:', error);
      return false;
    }
  }

  /**
   * Get available workflows for this organization
   */
  async getAvailableWorkflows(): Promise<N8nWorkflow[]> {
    await this.initializeClient();
    const workflows = await this.client!.getWorkflows();
    
    // Filter workflows based on organization permissions
    const config = await getN8nOrganizationConfig(this.organizationId);
    if (config?.allowed_workflows.length) {
      return workflows.filter(workflow => 
        config.allowed_workflows.includes(workflow.id)
      );
    }
    
    return workflows;
  }

  /**
   * Execute a workflow with permission checking
   */
  async executeWorkflow(
    workflowId: string, 
    executionRequest: Partial<N8nWorkflowExecutionRequest> = {},
    userRole: string = 'org_member'
  ): Promise<N8nExecutionResult> {
    try {
      // Check permissions
      const permission = await getN8nWorkflowPermission(workflowId, this.organizationId);
      if (!permission) {
        return {
          success: false,
          error: 'Workflow not accessible for this organization'
        };
      }

      if (!permission.user_roles.includes(userRole) && !permission.user_roles.includes('*')) {
        return {
          success: false,
          error: 'Insufficient permissions to execute this workflow'
        };
      }

      if (!permission.allowed_operations.includes('execute')) {
        return {
          success: false,
          error: 'Execute permission not granted for this workflow'
        };
      }

      // Execute the workflow
      await this.initializeClient();
      const result = await this.client!.executeWorkflow(workflowId, executionRequest);

      return {
        success: true,
        executionId: result.executionId,
        data: result.data
      };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process chat message and find matching triggers
   */
  async processChatMessage(
    message: string, 
    userRole: string = 'org_member'
  ): Promise<{
    triggers: N8nChatTrigger[];
    shouldExecute: boolean;
    confirmationRequired: boolean;
    confirmationMessage?: string;
  }> {
    try {
      const triggers = await findMatchingChatTriggers(message, this.organizationId, userRole);
      
      if (triggers.length === 0) {
        return {
          triggers: [],
          shouldExecute: false,
          confirmationRequired: false
        };
      }

      // If multiple triggers match, prioritize the first one
      const primaryTrigger = triggers[0];
      
      return {
        triggers,
        shouldExecute: !primaryTrigger.requiresConfirmation,
        confirmationRequired: primaryTrigger.requiresConfirmation,
        confirmationMessage: primaryTrigger.confirmationMessage
      };
    } catch (error) {
      console.error('Error processing chat message for n8n triggers:', error);
      return {
        triggers: [],
        shouldExecute: false,
        confirmationRequired: false
      };
    }
  }

  /**
   * Execute workflow from chat trigger
   */
  async executeChatTrigger(
    triggerId: string,
    message: string,
    userRole: string = 'org_member'
  ): Promise<N8nExecutionResult> {
    try {
      // Get the trigger details
      const { getN8nChatTrigger } = await import('@/app/dataAccess/n8n/n8nDataAccess');
      const trigger = await getN8nChatTrigger(triggerId);
      
      if (!trigger) {
        return {
          success: false,
          error: 'Chat trigger not found'
        };
      }

      // Check if user has permission
      if (!trigger.user_roles.includes(userRole) && !trigger.user_roles.includes('*')) {
        return {
          success: false,
          error: 'Insufficient permissions to execute this trigger'
        };
      }

      // Execute the workflow
      const result = await this.executeWorkflow(
        trigger.workflowId,
        {
          data: [{
            json: {
              message,
              triggerId,
              userRole,
              organizationId: this.organizationId,
              timestamp: new Date().toISOString()
            }
          }]
        },
        userRole
      );

      // Log the execution
      await this.logWorkflowExecution(trigger.workflowId, result, userRole);

      return result;
    } catch (error) {
      console.error('Error executing chat trigger:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Log workflow execution for analytics
   */
  private async logWorkflowExecution(
    workflowId: string, 
    result: N8nExecutionResult, 
    userRole: string
  ): Promise<void> {
    try {
      const { logN8nExecution } = await import('@/app/dataAccess/n8n/n8nDataAccess');
      await logN8nExecution({
        workflowId,
        organizationId: this.organizationId,
        userRole,
        success: result.success,
        executionId: result.executionId,
        error: result.error,
        data: result.data,
        executedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging workflow execution:', error);
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    try {
      await this.initializeClient();
      return await this.client!.getExecutionStatus(executionId);
    } catch (error) {
      console.error('Error getting execution status:', error);
      return null;
    }
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(workflowId: string, limit: number = 10): Promise<any[]> {
    try {
      await this.initializeClient();
      return await this.client!.getWorkflowExecutions(workflowId, limit);
    } catch (error) {
      console.error('Error getting workflow executions:', error);
      return [];
    }
  }

  /**
   * Get workflow suggestions based on user input
   */
  async getWorkflowSuggestions(
    message: string, 
    userRole: string = 'org_member'
  ): Promise<{
    suggestions: any[];
    confidence: number;
  }> {
    try {
      // Process the message to find matching triggers
      const chatResult = await this.processChatMessage(message, userRole);
      
      if (chatResult.triggers.length > 0) {
        return {
          suggestions: chatResult.triggers.map(trigger => ({
            id: trigger.id,
            workflowId: trigger.workflowId,
            title: trigger.name,
            description: trigger.description,
            icon: trigger.icon || 'zap',
            color: trigger.color || 'primary',
            requiresConfirmation: trigger.requiresConfirmation,
            confirmationMessage: trigger.confirmationMessage,
            confidence: 0.9 // High confidence for exact matches
          })),
          confidence: 0.9
        };
      }

      // If no exact matches, suggest workflows based on keywords
      const workflows = await this.getAvailableWorkflows();
      const suggestions = this.generateKeywordSuggestions(message, workflows, userRole);

      return {
        suggestions,
        confidence: 0.6 // Lower confidence for keyword-based suggestions
      };
    } catch (error) {
      console.error('Error getting workflow suggestions:', error);
      return {
        suggestions: [],
        confidence: 0
      };
    }
  }

  /**
   * Generate keyword-based workflow suggestions
   */
  private generateKeywordSuggestions(
    message: string, 
    workflows: any[], 
    userRole: string
  ): any[] {
    const lowerMessage = message.toLowerCase();
    const suggestions: any[] = [];

    // Define keyword mappings
    const keywordMappings = {
      'report': ['report', 'analytics', 'data', 'summary'],
      'email': ['email', 'notification', 'message', 'send'],
      'invoice': ['invoice', 'billing', 'payment', 'financial'],
      'backup': ['backup', 'sync', 'export', 'save'],
      'import': ['import', 'upload', 'data', 'file'],
      'reminder': ['reminder', 'notification', 'alert', 'schedule']
    };

    // Find workflows that match keywords
    workflows.forEach(workflow => {
      let matchScore = 0;
      let matchedKeywords: string[] = [];

      // Check workflow name and description
      const workflowText = `${workflow.name} ${workflow.description || ''}`.toLowerCase();

      // Check keyword mappings
      Object.entries(keywordMappings).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (lowerMessage.includes(keyword) && workflowText.includes(keyword)) {
            matchScore += 1;
            matchedKeywords.push(keyword);
          }
        });
      });

      // If we have a good match, add to suggestions
      if (matchScore > 0) {
        suggestions.push({
          id: workflow.id,
          workflowId: workflow.id,
          title: workflow.name,
          description: `Matches: ${matchedKeywords.join(', ')}`,
          icon: 'zap',
          color: 'secondary',
          requiresConfirmation: false,
          confidence: matchScore / 3 // Normalize score
        });
      }
    });

    // Sort by confidence and return top 5
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Get workflow performance metrics
   */
  async getWorkflowMetrics(workflowId: string): Promise<{
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    lastExecuted: string | null;
  }> {
    try {
      const { getN8nWorkflowMetrics } = await import('@/app/dataAccess/n8n/n8nDataAccess');
      return await getN8nWorkflowMetrics(workflowId, this.organizationId);
    } catch (error) {
      console.error('Error getting workflow metrics:', error);
      return {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        lastExecuted: null
      };
    }
  }
} 