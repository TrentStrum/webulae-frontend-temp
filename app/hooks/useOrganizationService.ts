'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import {
	Organization,
	OrganizationMember,
	CreateOrganizationInput,
	UpdateOrganizationInput,
	AddOrganizationMemberInput,
	UpdateOrganizationMemberInput,
} from '@/app/types/organization.types';
import { useNotifications } from '@/app/lib/stateContext';
import { useAuth, useOrganization, useOrganizationList } from '@clerk/nextjs';

export function useOrganizationService() {
	const queryClient = useQueryClient();
	const { addNotification } = useNotifications();
	const { userId } = useAuth();
	const { organization } = useOrganization();
	const { userMemberships } = useOrganizationList();

	// Get all organizations for the current user (from Clerk)
	function useGetOrganizations() {
		return useQuery({
			queryKey: ['organizations'],
			queryFn: () => Promise.resolve(userMemberships || []),
			enabled: !!userId,
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
		});
	}

	// Get the current active organization (from Clerk)
	function useGetCurrentOrganization() {
		return useQuery({
			queryKey: ['organizations', 'current'],
			queryFn: () => Promise.resolve(organization),
			enabled: !!userId,
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
		});
	}

	// Get organization details from our API (for additional metadata)
	function useGetOrganizationDetails(organizationId: string) {
		return useQuery({
			queryKey: ['organizations', organizationId, 'details'],
			queryFn: () => apiClient.get<Organization>(`/api/organization/${organizationId}`),
			enabled: !!organizationId && !!userId,
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
		});
	}

	// Create a new organization (using Clerk's createOrganization)
	function useCreateOrganization() {
		return useMutation({
			mutationFn: async (data: CreateOrganizationInput) => {
				// Create organization through our API which will handle Clerk integration
				const orgDetails = await apiClient.post<CreateOrganizationInput, Organization>(
					'/api/organization',
					{
						...data,
					},
				);

				return orgDetails;
			},
			onSuccess: () => {
				// Invalidate organizations list
				queryClient.invalidateQueries({ queryKey: ['organizations'] });

				// Show success notification
				addNotification({
					message: 'Organization created successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				addNotification({
					message: `Failed to create organization: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	// Update organization details
	function useUpdateOrganization() {
		return useMutation({
			mutationFn: async ({
				organizationId,
				...data
			}: { organizationId: string } & UpdateOrganizationInput) => {
				// Update additional metadata in our API
				return apiClient.put<Organization>(
					`/api/organization/${organizationId}`,
					data,
				);
			},
			onSuccess: (updatedOrganization) => {
				// Update the organization in the cache
				queryClient.setQueryData(
					['organizations', updatedOrganization.id, 'details'],
					updatedOrganization,
				);

				// Invalidate organizations list
				queryClient.invalidateQueries({ queryKey: ['organizations'] });

				addNotification({
					message: 'Organization updated successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				addNotification({
					message: `Failed to update organization: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	// Delete an organization
	function useDeleteOrganization() {
		return useMutation({
			mutationFn: async (organizationId: string) => {
				// Delete from our API
				return apiClient.delete(`/api/organization/${organizationId}`);
			},
			onSuccess: (_, organizationId) => {
				// Remove from cache
				queryClient.removeQueries({ queryKey: ['organizations', organizationId] });
				queryClient.invalidateQueries({ queryKey: ['organizations'] });

				addNotification({
					message: 'Organization deleted successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				addNotification({
					message: `Failed to delete organization: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	// Get all members of an organization
	function useGetOrganizationMembers(organizationId: string) {
		return useQuery({
			queryKey: ['organizations', organizationId, 'members'],
			queryFn: () =>
				apiClient.get<OrganizationMember[]>(`/api/organization/${organizationId}/members`),
			enabled: !!organizationId && !!userId,
			staleTime: 60000, // 1 minute
			gcTime: 300000, // 5 minutes
		});
	}

	// Add a member to an organization
	function useAddOrganizationMember(organizationId: string) {
		return useMutation({
			mutationFn: async (data: AddOrganizationMemberInput) => {
				// Add to our API
				return apiClient.post<AddOrganizationMemberInput, OrganizationMember>(
					`/api/organization/${organizationId}/members`,
					data,
				);
			},
			onSuccess: () => {
				// Invalidate members list
				queryClient.invalidateQueries({ queryKey: ['organizations', organizationId, 'members'] });

				addNotification({
					message: 'Member added successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				addNotification({
					message: `Failed to add member: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	// Update an organization member
	function useUpdateOrganizationMember(organizationId: string) {
		return useMutation({
			mutationFn: async ({
				memberId,
				...data
			}: { memberId: string } & UpdateOrganizationMemberInput) => {
				// Update in our API
				return apiClient.put<OrganizationMember>(
					`/api/organization/${organizationId}/members/${memberId}`,
					data,
				);
			},
			onSuccess: (updatedMember) => {
				// Update the member in the cache
				queryClient.setQueryData(
					['organizations', organizationId, 'members', updatedMember.id],
					updatedMember,
				);

				queryClient.setQueriesData(
					{ queryKey: ['organizations', organizationId, 'members'] },
					(oldData: OrganizationMember[] | undefined) => {
						if (!oldData) return oldData;
						return oldData.map((member) =>
							member.id === updatedMember.id ? updatedMember : member,
						);
					},
				);

				addNotification({
					message: 'Member updated successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				addNotification({
					message: `Failed to update member: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	// Remove a member from an organization
	function useRemoveOrganizationMember(organizationId: string) {
		return useMutation({
			mutationFn: async (memberId: string) => {
				// Remove from our API
				return apiClient.delete(`/api/organization/${organizationId}/members/${memberId}`);
			},
			onSuccess: (_, memberId) => {
				// Remove from cache
				queryClient.removeQueries({
					queryKey: ['organizations', organizationId, 'members', memberId],
				});
				queryClient.invalidateQueries({ queryKey: ['organizations', organizationId, 'members'] });

				addNotification({
					message: 'Member removed successfully',
					type: 'success',
				});
			},
			onError: (error) => {
				addNotification({
					message: `Failed to remove member: ${error.message}`,
					type: 'error',
				});
			},
		});
	}

	return {
		useGetOrganizations,
		useGetCurrentOrganization,
		useGetOrganizationDetails,
		useCreateOrganization,
		useUpdateOrganization,
		useDeleteOrganization,
		useGetOrganizationMembers,
		useAddOrganizationMember,
		useUpdateOrganizationMember,
		useRemoveOrganizationMember,
	};
}