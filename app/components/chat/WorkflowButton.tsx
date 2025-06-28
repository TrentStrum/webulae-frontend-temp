'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { IconBolt, IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';
import { N8nWorkflowButton } from '@/app/types/n8n.types';

interface WorkflowButtonProps {
  workflow: N8nWorkflowButton;
  onExecute: (workflowId: string) => void;
  onConfirm?: (workflowId: string) => void;
  onCancel?: () => void;
  isExecuting?: boolean;
  showConfirmation?: boolean;
  className?: string;
}

const getIcon = (icon?: string) => {
  switch (icon) {
    case 'zap':
      return <IconBolt className="h-4 w-4" />;
    case 'alert':
      return <IconAlertTriangle className="h-4 w-4" />;
    case 'check':
      return <IconCheck className="h-4 w-4" />;
    default:
      return <IconBolt className="h-4 w-4" />;
  }
};

const getColorClasses = (color?: string) => {
  switch (color) {
    case 'primary':
      return 'bg-primary text-primary-foreground hover:bg-primary/90';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
    case 'success':
      return 'bg-green-600 text-white hover:bg-green-700';
    case 'warning':
      return 'bg-yellow-600 text-white hover:bg-yellow-700';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700';
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary/90';
  }
};

export const WorkflowButton: React.FC<WorkflowButtonProps> = ({
  workflow,
  onExecute,
  onConfirm,
  onCancel,
  isExecuting = false,
  showConfirmation = false,
  className = ''
}) => {
  const handleClick = () => {
    if (workflow.requiresConfirmation && !showConfirmation) {
      onConfirm?.(workflow.workflowId);
    } else {
      onExecute(workflow.workflowId);
    }
  };

  if (showConfirmation) {
    return (
      <Card className={`max-w-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Confirm Action
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {workflow.confirmationMessage || `Are you sure you want to execute "${workflow.title}"?`}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onExecute(workflow.workflowId)}
                  disabled={isExecuting}
                  className="flex-1"
                >
                  {isExecuting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <IconCheck className="h-4 w-4 mr-2" />
                  )}
                  {isExecuting ? 'Executing...' : 'Confirm'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isExecuting}
                  className="flex-1"
                >
                  <IconX className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isExecuting}
      className={`justify-start text-left h-auto p-3 ${className}`}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0">
          {getIcon(workflow.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{workflow.title}</div>
          {workflow.description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {workflow.description}
            </div>
          )}
        </div>
        {workflow.requiresConfirmation && (
          <Badge variant="outline" className="text-xs">
            Confirm
          </Badge>
        )}
      </div>
    </Button>
  );
}; 