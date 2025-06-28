'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { useNotifications } from '@/app/lib/stateContext';
import { ARCHITECTURE_CONFIG } from '@/app/lib/env';

export interface CompanyKnowledge {
  id: string;
  category: string;
  title: string;
  content: string;
  service_name?: string;
  service_description?: string;
  pricing_info?: string;
  use_cases?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyKnowledgeInput {
  category: string;
  title: string;
  content: string;
  service_name?: string;
  service_description?: string;
  pricing_info?: string;
  use_cases?: string;
}

export interface UpdateCompanyKnowledgeInput {
  category?: string;
  title?: string;
  content?: string;
  service_name?: string;
  service_description?: string;
  pricing_info?: string;
  use_cases?: string;
}

export function useCompanyKnowledge() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Helper function to get the appropriate endpoint
  const getKnowledgeEndpoint = (path: string = '') => {
    if (ARCHITECTURE_CONFIG.USE_MODULAR_FOR_KNOWLEDGE) {
      return `/api/company-knowledge-new${path}`;
    }
    return `/api/company-knowledge${path}`;
  };

  // Get all company knowledge
  function useGetCompanyKnowledge() {
    return useQuery({
      queryKey: ['company-knowledge'],
      queryFn: async () => {
        const response = await apiClient.get<{ knowledge: CompanyKnowledge[] }>(getKnowledgeEndpoint());
        return response.knowledge;
      },
      staleTime: 300000, // 5 minutes
      gcTime: 600000, // 10 minutes
    });
  }

  // Get a specific company knowledge entry
  function useGetCompanyKnowledgeById(id: string) {
    return useQuery({
      queryKey: ['company-knowledge', id],
      queryFn: async () => {
        return apiClient.get<CompanyKnowledge>(getKnowledgeEndpoint(`/${id}`));
      },
      enabled: !!id,
      staleTime: 300000, // 5 minutes
      gcTime: 600000, // 10 minutes
    });
  }

  // Add new company knowledge
  function useAddCompanyKnowledge() {
    return useMutation({
      mutationFn: async (data: CreateCompanyKnowledgeInput) => {
        return apiClient.post<CreateCompanyKnowledgeInput, CompanyKnowledge>(
          getKnowledgeEndpoint(),
          data
        );
      },
      onSuccess: (newKnowledge) => {
        // Invalidate and refetch company knowledge
        queryClient.invalidateQueries({ queryKey: ['company-knowledge'] });
        
        addNotification({
          message: `Added "${newKnowledge.title}" to company knowledge base`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to add company knowledge: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Update company knowledge
  function useUpdateCompanyKnowledge() {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdateCompanyKnowledgeInput }) => {
        return apiClient.put<UpdateCompanyKnowledgeInput, CompanyKnowledge>(
          getKnowledgeEndpoint(`/${id}`),
          data
        );
      },
      onSuccess: (updatedKnowledge) => {
        // Update the specific knowledge in the cache
        queryClient.setQueryData(
          ['company-knowledge', updatedKnowledge.id],
          updatedKnowledge
        );
        
        // Invalidate and refetch all company knowledge
        queryClient.invalidateQueries({ queryKey: ['company-knowledge'] });
        
        addNotification({
          message: `Updated "${updatedKnowledge.title}" in company knowledge base`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to update company knowledge: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Delete company knowledge
  function useDeleteCompanyKnowledge() {
    return useMutation({
      mutationFn: async (id: string) => {
        return apiClient.delete(getKnowledgeEndpoint(`/${id}`));
      },
      onSuccess: (_, deletedId) => {
        // Remove from cache
        queryClient.removeQueries({ queryKey: ['company-knowledge', deletedId] });
        
        // Invalidate and refetch all company knowledge
        queryClient.invalidateQueries({ queryKey: ['company-knowledge'] });
        
        addNotification({
          message: 'Company knowledge deleted successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to delete company knowledge: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Quick add FAQ function
  function useAddFAQ() {
    return useMutation({
      mutationFn: async ({ question, answer }: { question: string; answer: string }) => {
        return apiClient.post<CreateCompanyKnowledgeInput, CompanyKnowledge>(
          getKnowledgeEndpoint(),
          {
            category: 'FAQ',
            title: question,
            content: answer,
          }
        );
      },
      onSuccess: (newFAQ) => {
        queryClient.invalidateQueries({ queryKey: ['company-knowledge'] });
        
        addNotification({
          message: `Added FAQ: "${newFAQ.title}"`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to add FAQ: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Quick add service knowledge function
  function useAddServiceKnowledge() {
    return useMutation({
      mutationFn: async (data: {
        serviceName: string;
        description: string;
        pricing?: string;
        useCases?: string;
      }) => {
        return apiClient.post<CreateCompanyKnowledgeInput, CompanyKnowledge>(
          getKnowledgeEndpoint(),
          {
            category: 'Services',
            title: data.serviceName,
            content: data.description,
            service_name: data.serviceName,
            service_description: data.description,
            pricing_info: data.pricing,
            use_cases: data.useCases,
          }
        );
      },
      onSuccess: (newService) => {
        queryClient.invalidateQueries({ queryKey: ['company-knowledge'] });
        
        addNotification({
          message: `Added service: "${newService.service_name}"`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to add service: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  return {
    useGetCompanyKnowledge,
    useGetCompanyKnowledgeById,
    useAddCompanyKnowledge,
    useUpdateCompanyKnowledge,
    useDeleteCompanyKnowledge,
    useAddFAQ,
    useAddServiceKnowledge,
  };
} 