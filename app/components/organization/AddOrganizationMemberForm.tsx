'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationMemberSchema, OrganizationMemberSchema } from '@/app/schemas/organizationSchema';
import { useOrganizationService } from '@/app/hooks/useOrganizationService';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

interface AddOrganizationMemberFormProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddOrganizationMemberForm({ 
  organizationId, 
  onSuccess, 
  onCancel 
}: AddOrganizationMemberFormProps) {
  const { useAddOrganizationMember } = useOrganizationService();
  const addMember = useAddOrganizationMember(organizationId);

  const form = useForm<OrganizationMemberSchema>({
    resolver: zodResolver(organizationMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = async (data: OrganizationMemberSchema) => {
    try {
      await addMember.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Organization Member</DialogTitle>
          <DialogDescription>
            Invite a new member to your organization. They will receive an email invitation.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="colleague@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The email address of the person you want to invite.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex flex-col">
                          <span className="font-medium">Admin</span>
                          <span className="text-sm text-muted-foreground">
                            Full access to manage organization and members
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="member">
                        <div className="flex flex-col">
                          <span className="font-medium">Member</span>
                          <span className="text-sm text-muted-foreground">
                            Can access projects and collaborate
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex flex-col">
                          <span className="font-medium">Viewer</span>
                          <span className="text-sm text-muted-foreground">
                            Read-only access to organization content
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the appropriate role for this member.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {addMember.isError && (
              <div className="bg-red-50 text-red-800 border-red-200">
                <p>
                  {addMember.error?.message || 'Failed to add member'}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={addMember.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMember.isPending}
              >
                {addMember.isPending ? 'Sending Invitation...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 