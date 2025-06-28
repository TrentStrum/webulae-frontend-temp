import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  PolicyGenerationRequest, 
  PolicyGenerationResponse, 
  PolicyTemplate,
  PolicyDocument 
} from '@/app/types/policyBot.types';

// API functions
const policyBotApi = {
  // Get available templates
  getTemplates: async (): Promise<{ templates: PolicyTemplate[]; categories: string[] }> => {
    const response = await axios.get('/api/policy-bot/generate');
    return response.data;
  },

  // Generate policy
  generatePolicy: async (request: PolicyGenerationRequest): Promise<PolicyGenerationResponse> => {
    const response = await axios.post('/api/policy-bot/generate', request);
    return response.data;
  },

  // Enhance content
  enhanceContent: async (params: {
    prompt: string;
    tone: string;
    language: string;
    sectionType: string;
  }): Promise<{ enhancedContent: string; suggestions: string[]; confidence: number }> => {
    const response = await axios.post('/api/policy-bot/enhance', params);
    return response.data;
  },

  // Save policy document
  savePolicy: async (policy: PolicyDocument): Promise<PolicyDocument> => {
    const response = await axios.post('/api/policy-bot/save', policy);
    return response.data;
  },

  // Get policy documents for organization
  getPolicyDocuments: async (organizationId: string): Promise<PolicyDocument[]> => {
    const response = await axios.get(`/api/policy-bot/documents?organizationId=${organizationId}`);
    return response.data;
  },

  // Get specific policy document
  getPolicyDocument: async (policyId: string): Promise<PolicyDocument> => {
    const response = await axios.get(`/api/policy-bot/documents/${policyId}`);
    return response.data;
  },

  // Update policy document
  updatePolicy: async (policyId: string, updates: Partial<PolicyDocument>): Promise<PolicyDocument> => {
    const response = await axios.put(`/api/policy-bot/documents/${policyId}`, updates);
    return response.data;
  },

  // Delete policy document
  deletePolicy: async (policyId: string): Promise<void> => {
    await axios.delete(`/api/policy-bot/documents/${policyId}`);
  }
};

// React Query hooks
export const usePolicyTemplates = () => {
  return useQuery({
    queryKey: ['policy-templates'],
    queryFn: policyBotApi.getTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePolicyGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyBotApi.generatePolicy,
    onSuccess: (data) => {
      // Invalidate policy documents cache
      queryClient.invalidateQueries({ queryKey: ['policy-documents'] });
      
      // Add to cache
      queryClient.setQueryData(['policy-document', data.policyId], data);
    },
    onError: (error) => {
      console.error('Policy generation failed:', error);
    }
  });
};

export const useContentEnhancement = () => {
  return useMutation({
    mutationFn: policyBotApi.enhanceContent,
    onError: (error) => {
      console.error('Content enhancement failed:', error);
    }
  });
};

export const usePolicyDocuments = (organizationId: string) => {
  return useQuery({
    queryKey: ['policy-documents', organizationId],
    queryFn: () => policyBotApi.getPolicyDocuments(organizationId),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePolicyDocument = (policyId: string) => {
  return useQuery({
    queryKey: ['policy-document', policyId],
    queryFn: () => policyBotApi.getPolicyDocument(policyId),
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSavePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyBotApi.savePolicy,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['policy-document', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['policy-documents'] });
    },
    onError: (error) => {
      console.error('Policy save failed:', error);
    }
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, updates }: { policyId: string; updates: Partial<PolicyDocument> }) =>
      policyBotApi.updatePolicy(policyId, updates),
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['policy-document', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['policy-documents'] });
    },
    onError: (error) => {
      console.error('Policy update failed:', error);
    }
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyBotApi.deletePolicy,
    onSuccess: (_, policyId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['policy-document', policyId] });
      queryClient.invalidateQueries({ queryKey: ['policy-documents'] });
    },
    onError: (error) => {
      console.error('Policy deletion failed:', error);
    }
  });
};

// Utility hooks
export const usePolicyBot = () => {
  const templates = usePolicyTemplates();
  const generatePolicy = usePolicyGeneration();
  const enhanceContent = useContentEnhancement();

  return {
    templates: templates.data,
    isLoading: templates.isLoading,
    error: templates.error,
    generatePolicy,
    enhanceContent
  };
}; 