import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AirtableConfig, AirtableBase, DataAnalysisRequest, DataAnalysisResponse, DatabaseDesignRequest, DatabaseDesignResponse } from '@/app/types/airtable.types';

// API client functions
const apiClient = {
  // Test Airtable connection
  testConnection: async (apiKey: string) => {
    const response = await fetch('/api/airtable/connection-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    return response.json();
  },

  // Get Airtable bases
  getBases: async (apiKey: string) => {
    const response = await fetch('/api/airtable/bases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    return response.json();
  },

  // Get Airtable configurations
  getConfigs: async () => {
    const response = await fetch('/api/airtable/configs');
    return response.json();
  },

  // Create Airtable configuration
  createConfig: async (config: { apiKey: string; baseId: string; baseName: string }) => {
    const response = await fetch('/api/airtable/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Update Airtable configuration
  updateConfig: async (config: Partial<AirtableConfig> & { id: string }) => {
    const response = await fetch('/api/airtable/configs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Delete Airtable configuration
  deleteConfig: async (id: string) => {
    const response = await fetch(`/api/airtable/configs?id=${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Analyze data
  analyzeData: async (request: DataAnalysisRequest) => {
    const response = await fetch('/api/airtable/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  },

  // Generate database design
  generateDesign: async (request: DatabaseDesignRequest) => {
    const response = await fetch('/api/airtable/design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  }
};

// React Query hooks
export const useAirtableConnectionTest = (apiKey: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['airtable', 'connection-test', apiKey],
    queryFn: () => apiClient.testConnection(apiKey),
    enabled: enabled && !!apiKey,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAirtableBases = (apiKey: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['airtable', 'bases', apiKey],
    queryFn: () => apiClient.getBases(apiKey),
    enabled: enabled && !!apiKey,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAirtableConfigs = () => {
  return useQuery({
    queryKey: ['airtable', 'configs'],
    queryFn: apiClient.getConfigs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateAirtableConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'configs'] });
    },
  });
};

export const useUpdateAirtableConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'configs'] });
    },
  });
};

export const useDeleteAirtableConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'configs'] });
    },
  });
};

export const useAnalyzeAirtableData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.analyzeData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airtable', 'analysis'] });
    },
  });
};

export const useGenerateDatabaseDesign = () => {
  return useMutation({
    mutationFn: apiClient.generateDesign,
  });
};

// Utility hooks for common operations
export const useAirtableSetup = () => {
  const createConfig = useCreateAirtableConfig();
  const updateConfig = useUpdateAirtableConfig();
  const deleteConfig = useDeleteAirtableConfig();

  return {
    createConfig,
    updateConfig,
    deleteConfig,
    isLoading: createConfig.isPending || updateConfig.isPending || deleteConfig.isPending,
    error: createConfig.error || updateConfig.error || deleteConfig.error,
  };
};

export const useAirtableAnalysis = () => {
  const analyzeData = useAnalyzeAirtableData();
  const generateDesign = useGenerateDatabaseDesign();

  return {
    analyzeData,
    generateDesign,
    isLoading: analyzeData.isPending || generateDesign.isPending,
    error: analyzeData.error || generateDesign.error,
  };
}; 