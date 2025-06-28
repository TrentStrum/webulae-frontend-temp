'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { IconBolt, IconRefresh, IconX } from '@tabler/icons-react';
import { WorkflowButton } from './WorkflowButton';
import { WorkflowBubble } from './WorkflowBubble';
import { N8nWorkflowButton, N8nWorkflowBubble, ChatWorkflowSuggestion } from '@/app/types/n8n.types';

interface WorkflowSuggestionsProps {
  organizationId: string;
  userRole: string;
  onExecuteWorkflow: (workflowId: string) => void;
  onClose?: () => void;
  className?: string;
}

export const WorkflowSuggestions: React.FC<WorkflowSuggestionsProps> = ({
  organizationId,
  userRole,
  onExecuteWorkflow,
  onClose,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<ChatWorkflowSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingWorkflowId, setExecutingWorkflowId] = useState<string | undefined>();
  const [confirmingWorkflowId, setConfirmingWorkflowId] = useState<string | undefined>();

  useEffect(() => {
    loadWorkflowSuggestions();
  }, [organizationId, userRole]);

  const loadWorkflowSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/org-admin/n8n/suggestions?organizationId=${organizationId}&userRole=${userRole}`);
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        console.error('Failed to load workflow suggestions');
      }
    } catch (error) {
      console.error('Error loading workflow suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      setExecutingWorkflowId(workflowId);
      
      const response = await fetch('/api/org-admin/n8n/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          organizationId,
          userRole,
          message: 'Executed via workflow button'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onExecuteWorkflow(workflowId);
        
        // Show success message
        // You can integrate this with your notification system
        console.log('Workflow executed successfully:', result);
      } else {
        throw new Error('Failed to execute workflow');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      // Show error message
    } finally {
      setExecutingWorkflowId(undefined);
      setConfirmingWorkflowId(undefined);
    }
  };

  const handleConfirmWorkflow = (workflowId: string) => {
    setConfirmingWorkflowId(workflowId);
  };

  const handleCancelWorkflow = () => {
    setConfirmingWorkflowId(undefined);
  };

  const renderSuggestion = (suggestion: ChatWorkflowSuggestion) => {
    switch (suggestion.type) {
      case 'workflow_button':
        return (
          <div key={suggestion.title} className="space-y-2">
            <div className="flex items-center gap-2">
              <IconBolt className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{suggestion.title}</span>
            </div>
            {suggestion.workflows.map((workflow) => (
              <WorkflowButton
                key={workflow.id}
                workflow={workflow}
                onExecute={handleExecuteWorkflow}
                onConfirm={handleConfirmWorkflow}
                onCancel={handleCancelWorkflow}
                isExecuting={executingWorkflowId === workflow.workflowId}
                showConfirmation={confirmingWorkflowId === workflow.workflowId}
              />
            ))}
          </div>
        );

      case 'workflow_bubble':
        return (
          <div key={suggestion.title}>
            <WorkflowBubble
              bubble={{
                id: suggestion.title,
                title: suggestion.title,
                description: suggestion.description,
                icon: suggestion.icon,
                category: suggestion.title,
                workflows: suggestion.workflows,
                active: true,
                order: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }}
              onExecuteWorkflow={handleExecuteWorkflow}
              onConfirmWorkflow={handleConfirmWorkflow}
              onCancelWorkflow={handleCancelWorkflow}
              executingWorkflowId={executingWorkflowId}
              confirmingWorkflowId={confirmingWorkflowId}
            />
          </div>
        );

      case 'workflow_category':
        return (
          <Card key={suggestion.title} className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconBolt className="h-4 w-4" />
                {suggestion.title}
              </CardTitle>
              {suggestion.description && (
                <p className="text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2">
                {suggestion.workflows.map((workflow) => (
                  <WorkflowButton
                    key={workflow.id}
                    workflow={workflow}
                    onExecute={handleExecuteWorkflow}
                    onConfirm={handleConfirmWorkflow}
                    onCancel={handleCancelWorkflow}
                    isExecuting={executingWorkflowId === workflow.workflowId}
                    showConfirmation={confirmingWorkflowId === workflow.workflowId}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className={`max-w-md ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading workflows...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={`max-w-md ${className}`}>
        <CardContent className="p-4">
          <div className="text-center py-6">
            <IconBolt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No workflows available for your role.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBolt className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Available Workflows</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadWorkflowSuggestions}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <IconRefresh className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {suggestions.length} categories available
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {suggestions.map(renderSuggestion)}
        </div>
      </CardContent>
    </Card>
  );
}; 