'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { IconChevronDown, IconChevronUp, IconBolt } from '@tabler/icons-react';
import { N8nWorkflowBubble, N8nWorkflowButton } from '@/app/types/n8n.types';
import { WorkflowButton } from './WorkflowButton';

interface WorkflowBubbleProps {
  bubble: N8nWorkflowBubble;
  onExecuteWorkflow: (workflowId: string) => void;
  onConfirmWorkflow?: (workflowId: string) => void;
  onCancelWorkflow?: () => void;
  executingWorkflowId?: string;
  confirmingWorkflowId?: string;
  className?: string;
}

export const WorkflowBubble: React.FC<WorkflowBubbleProps> = ({
  bubble,
  onExecuteWorkflow,
  onConfirmWorkflow,
  onCancelWorkflow,
  executingWorkflowId,
  confirmingWorkflowId,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExecute = (workflowId: string) => {
    onExecuteWorkflow(workflowId);
  };

  const handleConfirm = (workflowId: string) => {
    onConfirmWorkflow?.(workflowId);
  };

  const handleCancel = () => {
    onCancelWorkflow?.();
  };

  return (
    <Card className={`max-w-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBolt className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{bubble.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <IconChevronUp className="h-4 w-4" />
            ) : (
              <IconChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {bubble.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {bubble.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {bubble.workflows.length} workflows
          </Badge>
          <Badge variant="outline" className="text-xs">
            {bubble.category}
          </Badge>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {bubble.workflows.map((workflow) => (
              <WorkflowButton
                key={workflow.id}
                workflow={workflow}
                onExecute={handleExecute}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isExecuting={executingWorkflowId === workflow.workflowId}
                showConfirmation={confirmingWorkflowId === workflow.workflowId}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 