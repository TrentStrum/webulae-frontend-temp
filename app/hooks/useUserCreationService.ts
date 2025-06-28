'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { AdminUserCreateData } from '@/app/schemas/adminUserSchema';
import { useNotifications } from '@/app/lib/stateContext';
import type { User } from '@/app/types/user.types';

export function useUserCreationService() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Create a new user
  function useCreateUser() {
    return useMutation({
      mutationFn: (data: AdminUserCreateData) => 
        apiClient.post<AdminUserCreateData, User>('/api/users/create', data),
      onSuccess: (newUser) => { 
        // Invalidate users list cache
        queryClient.invalidateQueries({ queryKey: ['users'] });
        
        // Show success notification
        addNotification({
          message: `User ${newUser.name} created successfully. They will receive an email to set their password.`,
          type: 'success',
        });
      },
      onError: (error) => {
        addNotification({
          message: `Failed to create user: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  return {
    useCreateUser,
  };
} 