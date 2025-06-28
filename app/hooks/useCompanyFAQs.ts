'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/app/lib/stateContext';
import { apiClient } from '@/app/lib/apiClient';
import { 
  CompanyFAQ, 
  CreateFAQRequest, 
  UpdateFAQRequest 
} from '@/app/types/faq.types';

export function useCompanyFAQs() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Get all company FAQs
  function useGetFAQs() {
    return useQuery({
      queryKey: ['company-faqs'],
      queryFn: () => apiClient.get<{ faqs: CompanyFAQ[] }>('/api/admin/company-faqs'),
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  // Get a specific FAQ
  function useGetFAQ(faqId: string) {
    return useQuery({
      queryKey: ['company-faqs', faqId],
      queryFn: () => apiClient.get<CompanyFAQ>(`/api/admin/company-faqs/${faqId}`),
      enabled: !!faqId,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  // Create a new FAQ
  function useCreateFAQ() {
    return useMutation({
      mutationFn: (data: CreateFAQRequest) =>
        apiClient.post<CreateFAQRequest, CompanyFAQ>(
          '/api/admin/company-faqs',
          data
        ),
      onSuccess: (newFAQ) => {
        queryClient.invalidateQueries({ queryKey: ['company-faqs'] });
        
        addNotification({
          message: `Created FAQ: "${newFAQ.question}"`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to create FAQ: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Update a FAQ
  function useUpdateFAQ() {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateFAQRequest }) =>
        apiClient.put<UpdateFAQRequest, CompanyFAQ>(
          `/api/admin/company-faqs/${id}`,
          data
        ),
      onSuccess: (updatedFAQ) => {
        queryClient.invalidateQueries({ queryKey: ['company-faqs'] });
        queryClient.invalidateQueries({ queryKey: ['company-faqs', updatedFAQ.id] });
        
        addNotification({
          message: `Updated FAQ: "${updatedFAQ.question}"`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to update FAQ: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Delete a FAQ
  function useDeleteFAQ() {
    return useMutation({
      mutationFn: (faqId: string) =>
        apiClient.delete(`/api/admin/company-faqs/${faqId}`),
      onSuccess: (_, faqId) => {
        queryClient.invalidateQueries({ queryKey: ['company-faqs'] });
        
        addNotification({
          message: 'FAQ deleted successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to delete FAQ: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Toggle FAQ active status
  function useToggleFAQ() {
    return useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        apiClient.put<{ is_active: boolean }, CompanyFAQ>(
          `/api/admin/company-faqs/${id}`,
          { is_active: isActive }
        ),
      onSuccess: (updatedFAQ) => {
        queryClient.invalidateQueries({ queryKey: ['company-faqs'] });
        queryClient.invalidateQueries({ queryKey: ['company-faqs', updatedFAQ.id] });
        
        addNotification({
          message: `FAQ "${updatedFAQ.question}" ${updatedFAQ.is_active ? 'activated' : 'deactivated'}`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to toggle FAQ: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  return {
    useGetFAQs,
    useGetFAQ,
    useCreateFAQ,
    useUpdateFAQ,
    useDeleteFAQ,
    useToggleFAQ,
  };
} 