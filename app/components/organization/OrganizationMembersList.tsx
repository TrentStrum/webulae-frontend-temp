'use client';

import React, { useState } from 'react';
import { useOrganizationService } from '@/app/hooks/useOrganizationService';
import { OrganizationMember } from '@/app/types/organization.types';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { UserPlus, Trash2 } from 'lucide-react';
import { AddOrganizationMemberForm } from './AddOrganizationMemberForm';

interface OrganizationMembersListProps {
  organizationId: string;
}

export function OrganizationMembersList({ organizationId }: OrganizationMembersListProps) {
  const { userId } = useAuth();
  const { useGetOrganizationMembers, useUpdateOrganizationMember, useRemoveOrganizationMember } = useOrganizationService();
  
  const { data: members, isLoading, isError, error } = useGetOrganizationMembers(organizationId);
  const updateMember = useUpdateOrganizationMember(organizationId);
  const removeMember = useRemoveOrganizationMember(organizationId);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      await updateMember.mutateAsync({ memberId, role: newRole });
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await removeMember.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>Loading members...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>Failed to load members</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error: {error?.message || 'Unknown error'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>
              Manage your organization&apos;s members and their permissions
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddMember(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {members && members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No members found</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowAddMember(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Member</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Joined</th>
                    <th className="w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members?.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {member.user ? getInitials(member.user.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.user?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as 'admin' | 'member' | 'viewer')}
                          disabled={updateMember.isPending}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <Badge variant={member.isActive ? 'default' : 'secondary'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3">
                        {member.userId !== userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMemberToRemove(member)}
                            className="text-red-600 hover:text-red-700"
                            disabled={removeMember.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      {showAddMember && (
        <AddOrganizationMemberForm
          organizationId={organizationId}
          onSuccess={() => setShowAddMember(false)}
          onCancel={() => setShowAddMember(false)}
        />
      )}

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Remove Member</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove{' '}
              <strong>{memberToRemove?.user?.name || 'this member'}</strong> from the organization?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setMemberToRemove(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveMember}
                className="bg-red-600 hover:bg-red-700"
                disabled={removeMember.isPending}
              >
                {removeMember.isPending ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 