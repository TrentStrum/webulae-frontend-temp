'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/app/lib/stateContext';
import { apiClient } from '@/app/lib/apiClient';
import { 
  CompanySystemPrompt, 
  CreateSystemPromptRequest, 
  UpdateSystemPromptRequest 
} from '@/app/types/systemPrompt.types';

export function useCompanySystemPrompts() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Get all company system prompts
  function useGetSystemPrompts() {
    return useQuery({
      queryKey: ['company-system-prompts'],
      queryFn: () => apiClient.get<{ prompts: CompanySystemPrompt[] }>('/api/admin/company-system-prompts'),
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  // Get a specific system prompt
  function useGetSystemPrompt(promptId: string) {
    return useQuery({
      queryKey: ['company-system-prompts', promptId],
      queryFn: () => apiClient.get<CompanySystemPrompt>(`/api/admin/company-system-prompts/${promptId}`),
      enabled: !!promptId,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  // Create a new system prompt
  function useCreateSystemPrompt() {
    return useMutation({
      mutationFn: (data: CreateSystemPromptRequest) =>
        apiClient.post<CreateSystemPromptRequest, CompanySystemPrompt>(
          '/api/admin/company-system-prompts',
          data
        ),
      onSuccess: (newPrompt) => {
        queryClient.invalidateQueries({ queryKey: ['company-system-prompts'] });
        
        addNotification({
          message: `Created system prompt: "${newPrompt.prompt_name}"`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to create system prompt: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Update a system prompt
  function useUpdateSystemPrompt() {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateSystemPromptRequest }) =>
        apiClient.put<UpdateSystemPromptRequest, CompanySystemPrompt>(
          `/api/admin/company-system-prompts/${id}`,
          data
        ),
      onSuccess: (updatedPrompt) => {
        queryClient.invalidateQueries({ queryKey: ['company-system-prompts'] });
        queryClient.invalidateQueries({ queryKey: ['company-system-prompts', updatedPrompt.id] });
        
        addNotification({
          message: `Updated system prompt: "${updatedPrompt.prompt_name}"`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to update system prompt: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Delete a system prompt
  function useDeleteSystemPrompt() {
    return useMutation({
      mutationFn: (promptId: string) =>
        apiClient.delete(`/api/admin/company-system-prompts/${promptId}`),
      onSuccess: (_, promptId) => {
        queryClient.invalidateQueries({ queryKey: ['company-system-prompts'] });
        
        addNotification({
          message: 'System prompt deleted successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to delete system prompt: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Toggle system prompt active status
  function useToggleSystemPrompt() {
    return useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        apiClient.put<{ is_active: boolean }, CompanySystemPrompt>(
          `/api/admin/company-system-prompts/${id}`,
          { is_active: isActive }
        ),
      onSuccess: (updatedPrompt) => {
        queryClient.invalidateQueries({ queryKey: ['company-system-prompts'] });
        queryClient.invalidateQueries({ queryKey: ['company-system-prompts', updatedPrompt.id] });
        
        addNotification({
          message: `System prompt "${updatedPrompt.prompt_name}" ${updatedPrompt.is_active ? 'activated' : 'deactivated'}`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to toggle system prompt: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  return {
    useGetSystemPrompts,
    useGetSystemPrompt,
    useCreateSystemPrompt,
    useUpdateSystemPrompt,
    useDeleteSystemPrompt,
    useToggleSystemPrompt,
  };
} 