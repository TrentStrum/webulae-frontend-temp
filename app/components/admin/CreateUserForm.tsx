'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminUserCreateSchema, AdminUserCreateData } from '@/app/schemas/adminUserSchema';
import { useUserCreationService } from '@/app/hooks/useUserCreationService';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { UserPlus, Mail, Shield, Building, User } from 'lucide-react';

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { useCreateUser } = useUserCreationService();
  const createUser = useCreateUser();

  const form = useForm<AdminUserCreateData>({
    resolver: zodResolver(adminUserCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      organizationName: '',
      role: 'user',
    },
  });

  const onSubmit = async (data: AdminUserCreateData) => {
    console.log('Form data being submitted:', data);
    
    // Validate that username is not empty and meets minimum length
    if (!data.username || data.username.trim() === '') {
      console.error('Username is empty!');
      return;
    }
    
    if (data.username.length < 3) {
      console.error('Username must be at least 3 characters!');
      return;
    }
    
    try {
      await createUser.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the service
      console.error('Failed to create user:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Create New User
        </CardTitle>
        <CardDescription>
          Create a new user account in Clerk. They will receive an email to set their password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The user&apos;s full name as it will appear in the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="user@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The user&apos;s email address. They will receive a password setup email from Clerk.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="username" 
                      {...field} 
                      onChange={(e) => {
                        // Remove spaces and special characters
                        const value = e.target.value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique username for the user. This is required by Clerk. Must be at least 3 characters. Only letters, numbers, hyphens, and underscores allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organization Name *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter organization name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The organization this user belongs to. If it doesn&apos;t exist, it will be created automatically.
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
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    User Role
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Regular User</SelectItem>
                      <SelectItem value="org_member">Organization Member</SelectItem>
                      <SelectItem value="org_admin">Organization Admin</SelectItem>
                      <SelectItem value="global_admin">Global Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The user&apos;s role determines their permissions and access levels.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Mail className="h-4 w-4" />
                <span className="font-medium">What happens next?</span>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Organization will be created if it doesn&apos;t exist</li>
                <li>• User will be created in Clerk authentication system</li>
                <li>• User will be automatically added to the organization</li>
                <li>• They will receive an email with password setup instructions</li>
                <li>• They can sign in once they set their password</li>
              </ul>
            </div>

            {createUser.isError && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">
                  {createUser.error?.message || 'Failed to create user'}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={createUser.isPending}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={createUser.isPending}
              >
                {createUser.isPending ? 'Creating User...' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 