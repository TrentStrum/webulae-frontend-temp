'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/app/lib/stateContext';
import { ProfileSchema } from '@/app/schemas/profileSchema';
import { useAuth, useUser } from '@clerk/nextjs';
import { apiClient } from '@/app/lib/apiClient';
import type { User } from '@/app/types/user.types';

export function useUserService() {
	const queryClient = useQueryClient();
	const { addNotification } = useNotifications();
	const { userId } = useAuth();
	const { user } = useUser();
	
	// Current user profile - use Clerk's user data
	function useGetProfile() {
		return useQuery({
			queryKey: ['users', 'profile'],
			queryFn: () => Promise.resolve({
				id: user?.id || '',
				name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '',
				email: user?.emailAddresses[0]?.emailAddress || '',
				role: 'user', // Default role
				organizationName: user?.organizationMemberships?.[0]?.organization?.name || '',
				createdAt: user?.createdAt || '',
				updatedAt: user?.updatedAt || '',
			}),
			enabled: !!user,
			staleTime: 300000, // 5 minutes
			gcTime: 600000, // 10 minutes
		});
	}
	
	// Get all users - fetch from API
	function useGetUsers() {
		return useQuery({
			queryKey: ['users', 'all'],
			queryFn: () => apiClient.get<User[]>('/api/users'),
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
		});
	}

	function useGetUserById(userId: string) {
		return useQuery({
			queryKey: ['users', 'detail', userId],
			queryFn: () => apiClient.get<User>(`/api/users/${userId}`),
			enabled: !!userId,
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
		});
	}

	function useCreateUser() {
		return useMutation({
			mutationFn: async (data: { name: string; email: string }) => {
				// Note: User creation should be handled through Clerk's dashboard or invitation system
				// This is a placeholder that shows a notification
				throw new Error('User creation should be handled through Clerk dashboard or invitation system');
			},
			onError: (error) => {
				addNotification({
					message: `Failed to create user: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	function useDeleteUser() {
		return useMutation({
			mutationFn: async (userId: string) => {
				// Note: User deletion should be handled through Clerk's dashboard
				// This is a placeholder that shows a notification
				throw new Error('User deletion should be handled through Clerk dashboard');
			},
			onError: (error) => {
				addNotification({
					message: `Failed to delete user: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	function useUpdateProfile() {
		return useMutation({
			mutationFn: async ({ userId, ...data }: { userId: string } & ProfileSchema) => {
				// Note: Profile updates should be handled through Clerk's user management
				// This is a placeholder that shows a notification
				throw new Error('Profile updates should be handled through Clerk user management');
			},
			onError: (error) => {
				addNotification({
					message: `Failed to update profile: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	return {
		// Current user
		useGetProfile,
		
		// Admin or list-level
		useGetUsers,
		useGetUserById,
		useCreateUser,
		useDeleteUser,
		useUpdateProfile
	};
}