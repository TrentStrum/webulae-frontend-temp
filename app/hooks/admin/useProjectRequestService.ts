'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import type { ProjectRequest } from '@/app/types';

export function useProjectRequestService() {
  function useGetProjectRequests() {
    return useQuery({
      queryKey: ['projectRequests'],
      queryFn: () => apiClient.get<ProjectRequest[]>('/api/project-request'),
    });
  }

  function useUpdateProjectRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...data }: { id: string } & Partial<ProjectRequest>) =>
        apiClient.put(`/api/project-request/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectRequests'] });
      },
    });
  }

  return { useGetProjectRequests, useUpdateProjectRequest };
}
