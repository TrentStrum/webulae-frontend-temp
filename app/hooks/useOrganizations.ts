import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

// Query keys
const ORGANIZATIONS_QUERY_KEY = 'organizations';

export const useOrganizations = () => {
  const {
    data: organizations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [ORGANIZATIONS_QUERY_KEY],
    queryFn: async (): Promise<Organization[]> => {
      const response = await apiClient.get<Organization[]>('/api/admin/organizations');
      return response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    organizations,
    isLoading,
    error,
    refetch
  };
}; 