'use client';
import React, { memo } from 'react';
import { useWorkflowService } from '@/app/hooks/useWorkflowService';
import { Skeleton } from '@/components/ui/skeleton';
import { ClockIcon, CheckCircle2Icon, XCircleIcon, AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WorkflowExecution } from '@/app/types/workflow.types';

const statusConfig = {
  completed: {
    icon: CheckCircle2Icon,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  running: {
    icon: ClockIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  default: {
    icon: AlertCircleIcon,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
};

// Memoized execution item component to prevent unnecessary re-renders
const ExecutionItem = memo(({ execution }: { execution: WorkflowExecution }) => {
  const status = statusConfig[execution.status as keyof typeof statusConfig] || statusConfig.default;
  const StatusIcon = status.icon;

  return (
    <div className="group relative rounded-lg border p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn("mt-1 p-2 rounded-full", status.bg)}>
          <StatusIcon className={cn("h-5 w-5", status.color)} aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {execution.workflowId}
            </h3>
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", status.bg, status.color)}>
              {execution.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" aria-hidden="true" />
              <span>Started {new Date(execution.startedAt || '').toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ExecutionItem.displayName = 'ExecutionItem';

export default function WorkflowExecutions(): React.ReactElement {
  const { useGetExecutions, useTriggerWorkflow } = useWorkflowService();
  const { data: executions, isPending, isError, error, refetch } = useGetExecutions();
  const { mutate: triggerWorkflow, isPending: isTriggering } = useTriggerWorkflow();

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading workflow executions">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex justify-between items-center">
          <span>Failed to load executions: {error?.message || 'Unknown error'}</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Workflow Executions</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{executions.length} total</span>
          <Button 
            size="sm" 
            onClick={() => refetch()} 
            variant="outline"
            aria-label="Refresh executions"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {executions.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No workflow executions found</p>
            <Button 
              className="mt-4" 
              onClick={() => triggerWorkflow('default')}
              disabled={isTriggering}
            >
              Run Default Workflow
            </Button>
          </div>
        ) : (
          executions.slice(0, 5).map((execution: WorkflowExecution) => (
            <ExecutionItem key={execution.id} execution={execution} />
          ))
        )}
      </div>
    </div>
  );
}