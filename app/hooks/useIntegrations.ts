import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Integration, 
  IntegrationTemplate, 
  IntegrationWorkflow, 
  IntegrationTest,
  IntegrationEvent,
  IntegrationApiResponse,
  IntegrationListResponse,
  IntegrationTestResponse
} from '@/app/types/integrations.types';

// API client functions
const apiClient = {
  // Get integration templates (marketplace)
  getTemplates: async () => {
    const response = await fetch('/api/integrations/templates');
    return response.json();
  },

  // Get integrations for organization
  getIntegrations: async (params?: { page?: number; limit?: number; type?: string; provider?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.provider) searchParams.append('provider', params.provider);

    const response = await fetch(`/api/integrations?${searchParams.toString()}`);
    return response.json();
  },

  // Get single integration
  getIntegration: async (id: string) => {
    const response = await fetch(`/api/integrations/${id}`);
    return response.json();
  },

  // Create integration
  createIntegration: async (integration: Partial<Integration>) => {
    const response = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(integration)
    });
    return response.json();
  },

  // Update integration
  updateIntegration: async (id: string, updates: Partial<Integration>) => {
    const response = await fetch(`/api/integrations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  // Delete integration
  deleteIntegration: async (id: string) => {
    const response = await fetch(`/api/integrations/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Test integration connection
  testIntegration: async (id: string) => {
    const response = await fetch(`/api/integrations/${id}/test`, {
      method: 'POST'
    });
    return response.json();
  },

  // Get integration analytics
  getIntegrationAnalytics: async (id: string, period: 'hour' | 'day' | 'week' | 'month' = 'day') => {
    const response = await fetch(`/api/integrations/${id}/analytics?period=${period}`);
    return response.json();
  },

  // Get workflows for integration
  getWorkflows: async (integrationId?: string) => {
    const params = integrationId ? `?integrationId=${integrationId}` : '';
    const response = await fetch(`/api/integrations/workflows${params}`);
    return response.json();
  },

  // Get single workflow
  getWorkflow: async (id: string) => {
    const response = await fetch(`/api/integrations/workflows/${id}`);
    return response.json();
  },

  // Create workflow
  createWorkflow: async (workflow: Partial<IntegrationWorkflow>) => {
    const response = await fetch('/api/integrations/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    });
    return response.json();
  },

  // Update workflow
  updateWorkflow: async (id: string, updates: Partial<IntegrationWorkflow>) => {
    const response = await fetch(`/api/integrations/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  // Delete workflow
  deleteWorkflow: async (id: string) => {
    const response = await fetch(`/api/integrations/workflows/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Execute workflow
  executeWorkflow: async (id: string, data?: any) => {
    const response = await fetch(`/api/integrations/workflows/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    return response.json();
  },

  // Get integration tests
  getTests: async (integrationId?: string) => {
    const params = integrationId ? `?integrationId=${integrationId}` : '';
    const response = await fetch(`/api/integrations/tests${params}`);
    return response.json();
  },

  // Get single test
  getTest: async (id: string) => {
    const response = await fetch(`/api/integrations/tests/${id}`);
    return response.json();
  },

  // Create test
  createTest: async (test: Partial<IntegrationTest>) => {
    const response = await fetch('/api/integrations/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });
    return response.json();
  },

  // Update test
  updateTest: async (id: string, updates: Partial<IntegrationTest>) => {
    const response = await fetch(`/api/integrations/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  // Delete test
  deleteTest: async (id: string) => {
    const response = await fetch(`/api/integrations/tests/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Run test
  runTest: async (id: string) => {
    const response = await fetch(`/api/integrations/tests/${id}/run`, {
      method: 'POST'
    });
    return response.json();
  },

  // Get integration events
  getEvents: async (integrationId?: string, params?: { severity?: string; resolved?: boolean; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (integrationId) searchParams.append('integrationId', integrationId);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.resolved !== undefined) searchParams.append('resolved', params.resolved.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/integrations/events?${searchParams.toString()}`);
    return response.json();
  },

  // Resolve event
  resolveEvent: async (id: string) => {
    const response = await fetch(`/api/integrations/events/${id}/resolve`, {
      method: 'POST'
    });
    return response.json();
  },

  // Search marketplace
  searchMarketplace: async (query: string, filters?: any) => {
    const response = await fetch('/api/integrations/marketplace/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters })
    });
    return response.json();
  }
};

// React Query hooks for templates and marketplace
export const useIntegrationTemplates = () => {
  return useQuery({
    queryKey: ['integrations', 'templates'],
    queryFn: apiClient.getTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMarketplaceSearch = (query: string, filters?: any, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['integrations', 'marketplace', 'search', query, filters],
    queryFn: () => apiClient.searchMarketplace(query, filters),
    enabled: enabled && !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// React Query hooks for integrations
export const useIntegrations = (params?: { page?: number; limit?: number; type?: string; provider?: string }) => {
  return useQuery({
    queryKey: ['integrations', params],
    queryFn: () => apiClient.getIntegrations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useIntegration = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['integrations', id],
    queryFn: () => apiClient.getIntegration(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Integration> }) => 
      apiClient.updateIntegration(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.id] });
    },
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

export const useTestIntegration = () => {
  return useMutation({
    mutationFn: apiClient.testIntegration,
  });
};

export const useIntegrationAnalytics = (id: string, period: 'hour' | 'day' | 'week' | 'month' = 'day') => {
  return useQuery({
    queryKey: ['integrations', id, 'analytics', period],
    queryFn: () => apiClient.getIntegrationAnalytics(id, period),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// React Query hooks for workflows
export const useWorkflows = (integrationId?: string) => {
  return useQuery({
    queryKey: ['integrations', 'workflows', integrationId],
    queryFn: () => apiClient.getWorkflows(integrationId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWorkflow = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['integrations', 'workflows', id],
    queryFn: () => apiClient.getWorkflow(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'workflows'] });
    },
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<IntegrationWorkflow> }) => 
      apiClient.updateWorkflow(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', 'workflows', variables.id] });
    },
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'workflows'] });
    },
  });
};

export const useExecuteWorkflow = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => apiClient.executeWorkflow(id, data),
  });
};

// React Query hooks for tests
export const useTests = (integrationId?: string) => {
  return useQuery({
    queryKey: ['integrations', 'tests', integrationId],
    queryFn: () => apiClient.getTests(integrationId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTest = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['integrations', 'tests', id],
    queryFn: () => apiClient.getTest(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'tests'] });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<IntegrationTest> }) => 
      apiClient.updateTest(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'tests'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', 'tests', variables.id] });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'tests'] });
    },
  });
};

export const useRunTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.runTest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'tests'] });
      queryClient.invalidateQueries({ queryKey: ['integrations', 'tests', variables] });
    },
  });
};

// React Query hooks for events
export const useEvents = (integrationId?: string, params?: { severity?: string; resolved?: boolean; limit?: number }) => {
  return useQuery({
    queryKey: ['integrations', 'events', integrationId, params],
    queryFn: () => apiClient.getEvents(integrationId, params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useResolveEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.resolveEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'events'] });
    },
  });
};

// Utility hooks for common operations
export const useIntegrationManagement = () => {
  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();
  const deleteIntegration = useDeleteIntegration();
  const testIntegration = useTestIntegration();

  return {
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
    isLoading: createIntegration.isPending || updateIntegration.isPending || deleteIntegration.isPending || testIntegration.isPending,
    error: createIntegration.error || updateIntegration.error || deleteIntegration.error || testIntegration.error,
  };
};

export const useWorkflowManagement = () => {
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();
  const executeWorkflow = useExecuteWorkflow();

  return {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    isLoading: createWorkflow.isPending || updateWorkflow.isPending || deleteWorkflow.isPending || executeWorkflow.isPending,
    error: createWorkflow.error || updateWorkflow.error || deleteWorkflow.error || executeWorkflow.error,
  };
};

export const useTestManagement = () => {
  const createTest = useCreateTest();
  const updateTest = useUpdateTest();
  const deleteTest = useDeleteTest();
  const runTest = useRunTest();

  return {
    createTest,
    updateTest,
    deleteTest,
    runTest,
    isLoading: createTest.isPending || updateTest.isPending || deleteTest.isPending || runTest.isPending,
    error: createTest.error || updateTest.error || deleteTest.error || runTest.error,
  };
}; 