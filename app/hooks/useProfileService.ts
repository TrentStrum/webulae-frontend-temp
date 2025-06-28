'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { useNotifications } from '@/app/lib/stateContext';
import { ProfileSchema } from '@/app/schemas/profileSchema';
import { useAuth } from '@clerk/nextjs';

export function useProfileService() {
	const queryClient = useQueryClient();
	const { addNotification } = useNotifications();
	const { userId } = useAuth();
	
	// Get current user profile
	function useGetProfile() {
		return useQuery({
			queryKey: ['profile'],
			queryFn: () => apiClient.get('/api/profile'),
			enabled: !!userId,
			staleTime: 300000, // 5 minutes
			gcTime: 600000, // 10 minutes
		});
	}
	
	// Update current user profile
	function useUpdateProfile() {
		return useMutation({
			mutationFn: (data: Partial<ProfileSchema>) =>
				apiClient.put('/api/profile', data),
			onSuccess: (updatedProfile) => {
				// Update the profile in the cache
				queryClient.setQueryData(['profile'], updatedProfile);
				
				// Show success notification
				addNotification({
					message: 'Profile updated successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				// Show error notification
				addNotification({
					message: `Failed to update profile: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	return {
		useGetProfile,
		useUpdateProfile,
	};
} 