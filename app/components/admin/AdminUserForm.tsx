'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useUserService } from '@/app/hooks/useUserService';
import { profileSchema, type ProfileSchema } from '@/app/schemas/profileSchema';

type Props = {
	userId?: string;
	onSuccess?: () => void;
};

export function AdminUserForm({ userId, onSuccess }: Props): React.ReactElement {
	const { useGetUserById, useCreateUser, useUpdateProfile } = useUserService();

        const form = useForm<ProfileSchema>({
                resolver: zodResolver(profileSchema),
                defaultValues: {
                        firstName: '',
                        lastName: '',
                        email: '',
                        organizationName: '',
                },
        });

	const isEditing = !!userId;
	const { data: user, isPending: isLoading, isError } = useGetUserById(userId ?? '');

	const createUser = useCreateUser();
	const updateUser = useUpdateProfile();

	const isSaving = isEditing ? updateUser.isPending : createUser.isPending;

	React.useEffect(() => {
                if (user) {
                        form.reset({
                                firstName: user.name ?? '',
                                email: user.email ?? '',
                                organizationName: user.organizationName ?? '',
                        });
                }
	}, [user, form]);

	if (isEditing && isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-[200px]" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
			</div>
		);
	}

	if (isEditing && isError) {
		return <p className="text-red-500">Failed to load user.</p>;
	}

	const onSubmit = (data: ProfileSchema): void => {
		if (isEditing && userId) {
			updateUser.mutate({ userId, ...data }, { onSuccess });
		} else {
			createUser.mutate({ name: data.firstName, email: data.email }, { onSuccess });
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
			<h2 className="text-2xl font-bold">
				{isEditing ? 'Edit User' : 'Create User'}
			</h2>

			<div>
				<label className="block text-sm font-medium">First Name</label>
				<Input type="text" {...form.register('firstName')} />
				{form.formState.errors.firstName && (
					<p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
				)}
			</div>

                        <div>
                                <label className="block text-sm font-medium">Email</label>
                                <Input type="email" {...form.register('email')} />
                                {form.formState.errors.email && (
                                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                                )}
                        </div>

                        <div>
                                <label className="block text-sm font-medium">Organization Name</label>
                                <Input type="text" {...form.register('organizationName')} />
                                {form.formState.errors.organizationName && (
                                        <p className="text-sm text-red-500">{form.formState.errors.organizationName.message}</p>
                                )}
                        </div>

			<Button type="submit" disabled={isSaving}>
				{isSaving ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
			</Button>
		</form>
	);
}
