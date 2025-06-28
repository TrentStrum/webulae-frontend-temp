// app/hooks/useUserProfile.ts
'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { UserProfile } from '@/app/types/user.types';
import { apiClient } from '@/app/lib/apiClient';
import { ProfileSchema } from '../schemas/profileSchema';

export function useGetUsers() {
	return useQuery({
		queryKey: ['users'],
		queryFn: () =>
			apiClient.get<UserProfile[]>('/api/user'),
	});
}

export function useGetUserById(userId: string, options?: Omit<UseQueryOptions<UserProfile>, 'queryKey' | 'queryFn' | 'enabled'>) {
	return useQuery({
		queryKey: ['user', userId],
		queryFn: async () => {
			try {
				const response = await apiClient.get<UserProfile>(`/api/user/${userId}`);
				return response;
			} catch (error) {
				console.error('Error fetching user:', error);
				throw error;
			}
		},
		enabled: !!userId,
		...options,
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { name: string; email: string }) =>
			apiClient.post<Partial<UserProfile>, UserProfile>('/api/user', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) =>
			apiClient.delete<void>(`/api/user/${userId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, ...data }: { userId: string } & ProfileSchema) =>
			apiClient.put<Partial<ProfileSchema>>(`/api/user/${userId}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});
}
