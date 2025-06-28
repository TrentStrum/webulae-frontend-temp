'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSchema, OrganizationSchema } from '@/app/schemas/organizationSchema';
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
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

interface CreateOrganizationFormProps {
  onSuccess?: () => void;
}

export function CreateOrganizationForm({ onSuccess }: CreateOrganizationFormProps) {
  const { useCreateOrganization } = useOrganizationService();
  const createOrganization = useCreateOrganization();

  const form = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      industry: '',
      website: '',
    },
  });

  const onSubmit = async (data: OrganizationSchema) => {
    try {
      await createOrganization.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the service
      console.error('Failed to create organization:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Set up a new organization for your team to collaborate on projects and manage resources.
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
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the display name for your organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="organization-slug" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for your organization (lowercase, hyphens only).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your organization&apos;s purpose and goals"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help team members understand the organization&apos;s purpose.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Technology, Healthcare" {...field} />
                    </FormControl>
                    <FormDescription>
                      The primary industry your organization operates in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your organization&apos;s website URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {createOrganization.isError && (
              <div className="text-red-500">
                {createOrganization.error?.message || 'Failed to create organization'}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={createOrganization.isPending}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={createOrganization.isPending}
              >
                {createOrganization.isPending ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 