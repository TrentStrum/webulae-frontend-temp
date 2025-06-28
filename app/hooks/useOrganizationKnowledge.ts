import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface OrganizationKnowledge {
  id: string;
  organization_id: string;
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

export interface CreateOrganizationKnowledgeRequest {
  category: string;
  title: string;
  content: string;
  service_name?: string;
  service_description?: string;
  pricing_info?: string;
  use_cases?: string;
}

export interface UpdateOrganizationKnowledgeRequest {
  category?: string;
  title?: string;
  content?: string;
  service_name?: string;
  service_description?: string;
  pricing_info?: string;
  use_cases?: string;
}

// API functions
const fetchOrganizationKnowledge = async (organizationId: string): Promise<{ knowledge: OrganizationKnowledge[] }> => {
  const response = await fetch(`/api/organization/${organizationId}/knowledge`);
  if (!response.ok) {
    throw new Error('Failed to fetch organization knowledge');
  }
  return response.json();
};

const createOrganizationKnowledge = async (organizationId: string, data: CreateOrganizationKnowledgeRequest): Promise<OrganizationKnowledge> => {
  const response = await fetch(`/api/organization/${organizationId}/knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to create organization knowledge');
  }
  return response.json();
};

const updateOrganizationKnowledge = async (organizationId: string, id: string, data: UpdateOrganizationKnowledgeRequest): Promise<{ message: string }> => {
  const response = await fetch(`/api/organization/${organizationId}/knowledge/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to update organization knowledge');
  }
  return response.json();
};

const deleteOrganizationKnowledge = async (organizationId: string, id: string): Promise<{ message: string }> => {
  const response = await fetch(`/api/organization/${organizationId}/knowledge/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete organization knowledge');
  }
  return response.json();
};

// React Query Keys
const organizationKnowledgeKeys = {
  all: (organizationId: string) => ['organization-knowledge', organizationId] as const,
  lists: (organizationId: string) => [...organizationKnowledgeKeys.all(organizationId), 'list'] as const,
  list: (organizationId: string, filters: string) => [...organizationKnowledgeKeys.lists(organizationId), { filters }] as const,
  details: (organizationId: string) => [...organizationKnowledgeKeys.all(organizationId), 'detail'] as const,
  detail: (organizationId: string, id: string) => [...organizationKnowledgeKeys.details(organizationId), id] as const,
};

// Hook
export const useOrganizationKnowledge = (organizationId: string) => {
  const queryClient = useQueryClient();

  // Query for fetching all organization knowledge
  const {
    data: knowledgeData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: organizationKnowledgeKeys.lists(organizationId),
    queryFn: () => fetchOrganizationKnowledge(organizationId),
    enabled: !!organizationId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationKnowledgeRequest) => createOrganizationKnowledge(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKnowledgeKeys.lists(organizationId) });
      toast.success('Organization knowledge added successfully');
    },
    onError: (error) => {
      console.error('Error creating organization knowledge:', error);
      toast.error('Failed to add organization knowledge');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationKnowledgeRequest }) => 
      updateOrganizationKnowledge(organizationId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKnowledgeKeys.lists(organizationId) });
      toast.success('Organization knowledge updated successfully');
    },
    onError: (error) => {
      console.error('Error updating organization knowledge:', error);
      toast.error('Failed to update organization knowledge');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganizationKnowledge(organizationId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKnowledgeKeys.lists(organizationId) });
      toast.success('Organization knowledge deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting organization knowledge:', error);
      toast.error('Failed to delete organization knowledge');
    }
  });

  return {
    // Data
    knowledge: knowledgeData?.knowledge || [],
    
    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Actions
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    refetch,
    
    // Success states
    isCreateSuccess: createMutation.isSuccess,
    isUpdateSuccess: updateMutation.isSuccess,
    isDeleteSuccess: deleteMutation.isSuccess,
  };
}; 