'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import type { Workflow, WorkflowExecution } from '@/app/types';
import { useNotifications } from '@/app/lib/stateContext';

export function useWorkflowService() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  function useGetWorkflows() {
    return useQuery({
      queryKey: ['workflows'],
      queryFn: () => apiClient.get<Workflow[]>('/api/workflow'),
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  function useGetExecutions() {
    return useQuery({
      queryKey: ['workflowExecutions'],
      queryFn: () => apiClient.get<WorkflowExecution[]>('/api/workflow?executions=1'),
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }
  
  function useGetWorkflowById(id: string) {
    return useQuery({
      queryKey: ['workflows', id],
      queryFn: () => apiClient.get<Workflow>(`/api/workflow/${id}`),
      enabled: !!id,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  function useTriggerWorkflow() {
    return useMutation({
      mutationFn: (workflowId: string) =>
        apiClient.post<{ workflowId: string }, unknown>('/api/workflow', { workflowId }),
      onSuccess: () => {
        // Invalidate executions to show the new execution
        queryClient.invalidateQueries({ queryKey: queryKeys.workflows.executions });
        
        // Show success notification
        addNotification({
          message: 'Workflow triggered successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        // Show error notification
        addNotification({
          message: `Failed to trigger workflow: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  return { 
    useGetWorkflows, 
    useGetExecutions, 
    useGetWorkflowById,
    useTriggerWorkflow 
  };
}