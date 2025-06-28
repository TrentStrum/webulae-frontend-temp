'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SystemPrompt, CreateSystemPromptRequest, UpdateSystemPromptRequest } from '@/app/types/systemPrompt.types';
import { apiClient } from '@/app/lib/apiClient';

// Query keys
const ORGANIZATION_SYSTEM_PROMPTS_QUERY_KEY = 'organization-system-prompts';

export const useOrganizationSystemPrompts = (selectedOrganizationId?: string) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch all organization system prompts
  const {
    data: systemPrompts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [ORGANIZATION_SYSTEM_PROMPTS_QUERY_KEY, selectedOrganizationId],
    queryFn: async (): Promise<SystemPrompt[]> => {
      console.log('Fetching prompts for org:', selectedOrganizationId);
      if (!selectedOrganizationId) return [];
      const response = await apiClient.get(`/api/admin/organization-system-prompts?organizationId=${selectedOrganizationId}`);
      console.log('Full response object:', response);
      console.log('API response data:', response);
      console.log('API response type:', typeof response);
      console.log('API response length:', Array.isArray(response) ? response.length : 'not array');
      const data = response ?? [];
      // Map the API response fields to match frontend expectations
      const mappedData = data.map((prompt: any) => ({
        id: prompt.id,
        name: prompt.prompt_name, // Map prompt_name to name
        content: prompt.content,
        category: prompt.category,
        priority: prompt.priority,
        is_active: prompt.is_active,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at,
        organization_id: prompt.organization_id
      }));
      console.log('Mapped data:', mappedData);
      return mappedData;
    },
    enabled: !!selectedOrganizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter system prompts based on search and filters
  const filteredSystemPrompts = systemPrompts.filter(prompt => {
    const matchesSearch = !searchTerm || 
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && prompt.is_active) ||
      (statusFilter === 'inactive' && !prompt.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(systemPrompts.map(prompt => prompt.category))).sort();

  // Create system prompt mutation
  const createSystemPromptMutation = useMutation({
    mutationFn: async (data: CreateSystemPromptRequest): Promise<SystemPrompt> => {
      const response = await apiClient.post('/api/admin/organization-system-prompts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_SYSTEM_PROMPTS_QUERY_KEY] });
    },
  });

  // Update system prompt mutation
  const updateSystemPromptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSystemPromptRequest }): Promise<SystemPrompt> => {
      const response = await apiClient.put(`/api/admin/organization-system-prompts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_SYSTEM_PROMPTS_QUERY_KEY] });
    },
  });

  // Delete system prompt mutation
  const deleteSystemPromptMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/admin/organization-system-prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_SYSTEM_PROMPTS_QUERY_KEY] });
    },
  });

  // Toggle system prompt status mutation
  const toggleSystemPromptStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<SystemPrompt> => {
      const response = await apiClient.put(`/api/admin/organization-system-prompts/${id}`, {
        is_active: isActive
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_SYSTEM_PROMPTS_QUERY_KEY] });
    },
  });

  // Create system prompt
  const createSystemPrompt = async (data: CreateSystemPromptRequest) => {
    try {
      const result = await createSystemPromptMutation.mutateAsync(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Update system prompt
  const updateSystemPrompt = async (id: string, data: UpdateSystemPromptRequest) => {
    try {
      const result = await updateSystemPromptMutation.mutateAsync({ id, data });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Delete system prompt
  const deleteSystemPrompt = async (id: string) => {
    try {
      await deleteSystemPromptMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Toggle system prompt status
  const toggleSystemPromptStatus = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleSystemPromptStatusMutation.mutateAsync({ id, isActive });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    // Data
    systemPrompts: filteredSystemPrompts,
    allSystemPrompts: systemPrompts,
    categories,
    
    // Loading states
    isLoading,
    isCreating: createSystemPromptMutation.isPending,
    isUpdating: updateSystemPromptMutation.isPending,
    isDeleting: deleteSystemPromptMutation.isPending,
    isTogglingStatus: toggleSystemPromptStatusMutation.isPending,
    
    // Error states
    error,
    createError: createSystemPromptMutation.error,
    updateError: updateSystemPromptMutation.error,
    deleteError: deleteSystemPromptMutation.error,
    toggleError: toggleSystemPromptStatusMutation.error,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    
    // Actions
    createSystemPrompt,
    updateSystemPrompt,
    deleteSystemPrompt,
    toggleSystemPromptStatus,
    refetch,
  };
}; 