import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { 
  getN8nOrganizationConfig,
  getN8nWorkflowPermissions,
  getN8nChatTriggers
} from '@/app/dataAccess/n8n/n8nDataAccess';
import { N8nService } from '@/app/lib/n8n/n8nService';
import { ChatWorkflowSuggestion } from '@/app/types/n8n.types';

// Schema for workflow suggestions request
const suggestionsRequestSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  userRole: z.string().min(1, 'User role is required'),
  message: z.string().optional(),
  context: z.string().optional(),
});

export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId, orgId } = await getAuth(req);
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const organizationId = url.searchParams.get('organizationId');
    const userRole = url.searchParams.get('userRole');
    const message = url.searchParams.get('message') || '';

    if (!organizationId || !userRole) {
      return NextResponse.json(
        { error: 'Organization ID and user role are required' },
        { status: 400 }
      );
    }

    // Initialize n8n service
    const n8nService = new N8nService(organizationId);
    
    // Check if n8n is configured
    const isConfigured = await n8nService.isConfigured();
    if (!isConfigured) {
      return NextResponse.json({
        suggestions: []
      });
    }

    // Get available workflows
    const workflows = await n8nService.getAvailableWorkflows();
    
    // Generate contextual suggestions based on message and workflows
    const suggestions: ChatWorkflowSuggestion[] = [];

    // If there's a message, try to find matching triggers
    if (message) {
      const chatResult = await n8nService.processChatMessage(message, userRole);
      
      if (chatResult.triggers.length > 0) {
        // Create workflow button suggestions for matching triggers
        const triggerSuggestions: ChatWorkflowSuggestion[] = chatResult.triggers.map(trigger => ({
          type: 'workflow_button',
          title: trigger.name,
          description: trigger.description,
          icon: trigger.icon || 'zap',
          workflows: [{
            id: trigger.id,
            workflowId: trigger.workflowId,
            title: trigger.name,
            description: trigger.description,
            icon: trigger.icon || 'zap',
            color: trigger.color || 'primary',
            requiresConfirmation: trigger.requiresConfirmation,
            confirmationMessage: trigger.confirmationMessage
          }]
        }));
        
        suggestions.push(...triggerSuggestions);
      }
    }

    // Add general workflow categories if no specific matches
    if (suggestions.length === 0 && workflows.length > 0) {
      // Group workflows by category
      const workflowCategories = workflows.reduce((acc, workflow) => {
        const category = workflow.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(workflow);
        return acc;
      }, {} as Record<string, typeof workflows>);

      // Create category suggestions
      Object.entries(workflowCategories).forEach(([category, categoryWorkflows]) => {
        if (categoryWorkflows.length > 0) {
          suggestions.push({
            type: 'workflow_category',
            title: category,
            description: `Available ${category.toLowerCase()} workflows`,
            icon: 'zap',
            workflows: categoryWorkflows.slice(0, 5).map(workflow => ({
              id: workflow.id,
              workflowId: workflow.id,
              title: workflow.name,
              description: workflow.description || 'Execute workflow',
              icon: 'zap',
              color: 'primary',
              requiresConfirmation: false
            }))
          });
        }
      });
    }

    // Add quick action bubbles for common workflows
    const quickActions: ChatWorkflowSuggestion[] = [
      {
        type: 'workflow_bubble',
        title: 'Quick Actions',
        description: 'Common workflow shortcuts',
        icon: 'zap',
        workflows: workflows.slice(0, 3).map(workflow => ({
          id: workflow.id,
          workflowId: workflow.id,
          title: workflow.name,
          description: workflow.description || 'Execute workflow',
          icon: 'zap',
          color: 'primary',
          requiresConfirmation: false
        }))
      }
    ];

    if (quickActions[0].workflows.length > 0) {
      suggestions.push(...quickActions);
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 10) // Limit to 10 suggestions
    });

  } catch (error) {
    logServerError('GET /api/org-admin/n8n/suggestions', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 