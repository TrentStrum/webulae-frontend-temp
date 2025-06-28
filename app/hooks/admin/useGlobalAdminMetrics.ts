'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import { GlobalAdminMetrics } from '@/app/types/metrics.types';

export function useGlobalAdminMetrics() {
  return useQuery({
    queryKey: queryKeys.metrics.globalAdmin,
    queryFn: () => apiClient.get<GlobalAdminMetrics>('/api/metrics/global-admin'),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
} 