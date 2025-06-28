'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import { Metrics, DashboardMetrics } from '@/app/types/metrics.types';

export function useMetricsService() {
  function useGetMetrics() {
    return useQuery({
      queryKey: queryKeys.metrics.all,
      queryFn: () => apiClient.get<Metrics>('/api/metrics'),
      staleTime: 300000, // 5 minutes
      gcTime: 600000, // 10 minutes
    });
  }
  
  function useGetDashboardMetrics() {
    return useQuery({
      queryKey: queryKeys.metrics.dashboard,
      queryFn: () => apiClient.get<DashboardMetrics>('/api/metrics/dashboard'),
      staleTime: 300000, // 5 minutes
      gcTime: 600000, // 10 minutes
    });
  }

  return { useGetMetrics, useGetDashboardMetrics };
}