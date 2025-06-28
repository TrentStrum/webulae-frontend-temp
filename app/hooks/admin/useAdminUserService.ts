// /app/hooks/admin/useUserAdminService.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { UserProfile } from '@/app/types/user.types';

type UpdateUserRoleInput = {
	userId: string;
	role: string;
};

function useGetUsers() {
	return useQuery({
		queryKey: ['users'],
		queryFn: () => apiClient.get<UserProfile[]>('/api/user'),
	});
}

function useUpdateUserRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ userId, role }: UpdateUserRoleInput) => {
			return apiClient.patch<UpdateUserRoleInput>(`/api/user/${userId}/role`, { role });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});
}

export function useUserAdminService() {
	return {
		useGetUsers,
		useUpdateUserRole,
		// future: useGetAllUsers, useDeleteUser, etc.
	};
}
