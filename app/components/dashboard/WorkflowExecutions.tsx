'use client';
import React, { memo } from 'react';
import { useWorkflowService } from '@/app/hooks/useWorkflowService';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowExecution } from '@/app/types/workflow.types';

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-200 dark:border-green-900/30',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-200 dark:border-red-900/30',
  },
  running: {
    icon: Clock,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-900/30',
  },
  default: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-200 dark:border-yellow-900/30',
  },
};

// Memoized execution item component to prevent unnecessary re-renders
const ExecutionItem = memo(({ execution }: { execution: WorkflowExecution }) => {
  const status = statusConfig[execution.status as keyof typeof statusConfig] || statusConfig.default;
  const StatusIcon = status.icon;

  return (
    <Card className={cn("group relative hover:shadow-sm transition-all", status.border)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn("mt-1 p-2 rounded-lg", status.bg)}>
            <StatusIcon className={cn("h-5 w-5", status.color)} aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {execution.workflowId}
              </h3>
              <Badge className={cn(
                "text-xs",
                execution.status === 'completed' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                execution.status === 'failed' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                execution.status === 'running' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
              )}>
                {execution.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>Started {new Date(execution.startedAt || '').toLocaleString()}</span>
              </div>
              {execution.completedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  <span>Completed {new Date(execution.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
            {execution.error && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20">
                <p className="font-medium">Error:</p>
                <p>{execution.error}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
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
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex justify-between items-center">
          <span>Failed to load executions: {error?.message || 'Unknown error'}</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {executions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              No Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No workflow executions found</h3>
              <p className="text-muted-foreground mb-6">
                Run your first workflow to see execution history and results
              </p>
              <Button 
                onClick={() => triggerWorkflow('default')}
                disabled={isTriggering}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                {isTriggering ? 'Running...' : 'Run Default Workflow'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3 pr-4">
            {executions.slice(0, 5).map((execution: WorkflowExecution) => (
              <ExecutionItem key={execution.id} execution={execution} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}