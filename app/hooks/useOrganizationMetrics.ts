'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import { OrganizationMetrics } from '@/app/types/metrics.types';

export function useOrganizationMetrics(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.metrics.organization(organizationId),
    queryFn: () => apiClient.get<OrganizationMetrics>(`/api/metrics/organization/${organizationId}`),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    enabled: !!organizationId,
  });
} 