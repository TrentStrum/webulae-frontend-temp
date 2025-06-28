'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import { MetricsTimeSeries } from '@/app/types/metrics.types';

export function useTimeSeriesMetrics(timeframe: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: queryKeys.metrics.timeSeries(timeframe),
    queryFn: () => apiClient.get<MetricsTimeSeries>(`/api/metrics/timeseries?timeframe=${timeframe}`),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
} 