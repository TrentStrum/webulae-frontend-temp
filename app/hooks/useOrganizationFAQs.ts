import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FAQ, CreateFAQRequest, UpdateFAQRequest } from '@/app/types/faq.types';
import { apiClient } from '@/app/lib/apiClient';

// Query keys
const ORGANIZATION_FAQS_QUERY_KEY = 'organization-faqs';

export const useOrganizationFAQs = (organizationId?: string) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch organization FAQs
  const {
    data: faqs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [ORGANIZATION_FAQS_QUERY_KEY, organizationId],
    queryFn: async (): Promise<FAQ[]> => {
      if (!organizationId) {
        return [];
      }
      const response = await apiClient.get(`/api/admin/organization-faqs?organizationId=${organizationId}`);
      return response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!organizationId, // Only run query if organizationId is provided
  });

  // Filter FAQs based on search and filters
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchTerm || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || faq.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && faq.is_active) ||
      (statusFilter === 'inactive' && !faq.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(faqs.map(faq => faq.category))).sort();

  // Create FAQ mutation
  const createFAQMutation = useMutation({
    mutationFn: async (data: CreateFAQRequest): Promise<FAQ> => {
      const response = await apiClient.post('/api/admin/organization-faqs', {
        ...data,
        organization_id: organizationId
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_FAQS_QUERY_KEY, organizationId] });
    },
  });

  // Update FAQ mutation
  const updateFAQMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFAQRequest }): Promise<FAQ> => {
      const response = await apiClient.put(`/api/admin/organization-faqs/${id}`, {
        ...data,
        organization_id: organizationId
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_FAQS_QUERY_KEY, organizationId] });
    },
  });

  // Delete FAQ mutation
  const deleteFAQMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/admin/organization-faqs/${id}?organizationId=${organizationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_FAQS_QUERY_KEY, organizationId] });
    },
  });

  // Toggle FAQ status mutation
  const toggleFAQStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<FAQ> => {
      const response = await apiClient.put(`/api/admin/organization-faqs/${id}`, {
        is_active: isActive,
        organization_id: organizationId
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANIZATION_FAQS_QUERY_KEY, organizationId] });
    },
  });

  // Create FAQ
  const createFAQ = async (data: CreateFAQRequest) => {
    try {
      const result = await createFAQMutation.mutateAsync(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Update FAQ
  const updateFAQ = async (id: string, data: UpdateFAQRequest) => {
    try {
      const result = await updateFAQMutation.mutateAsync({ id, data });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Delete FAQ
  const deleteFAQ = async (id: string) => {
    try {
      await deleteFAQMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Toggle FAQ status
  const toggleFAQStatus = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleFAQStatusMutation.mutateAsync({ id, isActive });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    // Data
    faqs: filteredFaqs,
    filteredFaqs: filteredFaqs,
    allFaqs: faqs,
    categories,
    
    // Loading states
    isLoading,
    isCreating: createFAQMutation.isPending,
    isUpdating: updateFAQMutation.isPending,
    isDeleting: deleteFAQMutation.isPending,
    isTogglingStatus: toggleFAQStatusMutation.isPending,
    
    // Error states
    error,
    createError: createFAQMutation.error,
    updateError: updateFAQMutation.error,
    deleteError: deleteFAQMutation.error,
    toggleError: toggleFAQStatusMutation.error,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    
    // Actions
    createFAQ,
    updateFAQ,
    deleteFAQ,
    toggleFAQStatus,
    refetch,
  };
}; 