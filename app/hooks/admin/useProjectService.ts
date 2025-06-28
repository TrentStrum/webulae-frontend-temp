'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { Project, UpdatePayload } from '@/app/types/project.types';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import { useNotifications } from '@/app/lib/stateContext';

export function useProjectService() {
	const queryClient = useQueryClient();
	const { addNotification } = useNotifications();
	
	function useGetProjects() {
		return useQuery({
			queryKey: ['projects'],
			queryFn: () => apiClient.get<Project[]>('/api/project'),
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
		});
	}

	function useGetProjectById(
		projectId: string,
		options?: Omit<UseQueryOptions<Project, Error, Project, ReturnType<typeof queryKeys.projects.detail>>, 'queryKey' | 'queryFn'>
	) {
		return useQuery<Project, Error, Project, ReturnType<typeof queryKeys.projects.detail>>({
			queryKey: ['project', projectId],
			queryFn: () => apiClient.get<Project>(`/api/project/${projectId}`),
			enabled: !!projectId,
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
			...options,
		});
	}

	function useCreateProject() {
		return useMutation({
			mutationFn: (data: Partial<Project>) => apiClient.post('/api/project', data),
			onSuccess: (newProject) => {
				// Update the projects list cache
				queryClient.setQueriesData({ queryKey: queryKeys.projects.all }, (oldData: Project[] | undefined) => {
					if (!oldData) return [newProject];
					return [...oldData, newProject];
				});
				
				// Invalidate to ensure fresh data on next fetch
				queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
				
				// Show success notification
				addNotification({
					message: 'Project created successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				// Show error notification
				addNotification({
					message: `Failed to create project: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	function useUpdateProject() {
		return useMutation({
			mutationFn: ({ projectId, ...data }: UpdatePayload) =>
				apiClient.put<Project>(`/api/project/${projectId}`, data),
			onSuccess: (updatedProject: Project) => {
				// Update the project in the cache
				queryClient.setQueryData(
					queryKeys.projects.detail(updatedProject.projectId), 
					updatedProject
				);
				
				// Update the project in the projects list cache if it exists
				queryClient.setQueriesData({ queryKey: queryKeys.projects.all }, (oldData: Project[] | undefined) => {
					if (!oldData) return oldData;
					return oldData.map(project => 
						project.projectId === updatedProject.projectId ? updatedProject : project
					);
				});
				
				// Show success notification
				addNotification({
					message: 'Project updated successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				// Show error notification
				addNotification({
					message: `Failed to update project: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	function useDeleteProject() {
		return useMutation({
			mutationFn: (projectId: string) => apiClient.delete(`/api/project/${projectId}`),
			onSuccess: (_, projectId) => {
				// Remove the project from the cache
				queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
				
				// Update the projects list cache if it exists
				queryClient.setQueriesData({ queryKey: queryKeys.projects.all }, (oldData: Project[] | undefined) => {
					if (!oldData) return oldData;
					return oldData.filter(project => project.projectId !== projectId);
				});
				
				// Show success notification
				addNotification({
					message: 'Project deleted successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				// Show error notification
				addNotification({
					message: `Failed to delete project: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	// Batch operations for improved performance
	function useBatchCreateProjects() {
		return useMutation({
			mutationFn: (projects: Partial<Project>[]) => 
				apiClient.post<Partial<Project>[], Project[]>('/api/project/batch', projects),
			onSuccess: (newProjects) => {
				// Update the projects list cache
				queryClient.setQueriesData({ queryKey: queryKeys.projects.all }, (oldData: Project[] | undefined) => {
					if (!oldData) return newProjects;
					return [...oldData, ...newProjects];
				});
				
				// Invalidate to ensure fresh data on next fetch
				queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
				
				// Show success notification
				addNotification({
					message: `${newProjects.length} projects created successfully`,
					type: 'success',
				});
			},
			onError: (error) => {
				// Show error notification
				addNotification({
					message: `Failed to create projects: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	return {
		useGetProjects,
		useGetProjectById,
		useCreateProject,
		useUpdateProject,
		useDeleteProject,
		useBatchCreateProjects
	};
}