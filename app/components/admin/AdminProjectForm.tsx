'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useProjectService } from '@/app/hooks/admin/useProjectService';
import { projectSchema, type ProjectSchema } from '@/app/schemas/projectSchema';

type Props = {
	projectId?: string;
	onSuccess?: () => void;
};

export function AdminProjectForm({ projectId, onSuccess }: Props): React.ReactElement {
	const { useGetProjectById, useUpdateProject, useCreateProject } = useProjectService();

	const form = useForm<ProjectSchema>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const isEditing = !!projectId;
	const {
		data: project,
		isPending: isLoading,
		isError,
	} = useGetProjectById(projectId ?? '', {
		enabled: Boolean(projectId),
	});

	const createProject = useCreateProject();
	const updateProject = useUpdateProject();

	const isSaving = isEditing ? updateProject.isPending : createProject.isPending;

	React.useEffect(() => {
		if (project) {
			form.reset({
				name: project.name ?? '',
				description: project.description ?? '',
			});
		}
	}, [project, form]);

	if (isEditing && isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-[200px]" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (isEditing && isError) {
		return <p className="text-red-500">Failed to load project.</p>;
	}

	const onSubmit = (data: ProjectSchema): void => {
		if (isEditing) {
			updateProject.mutate({ projectId: projectId!, ...data }, { onSuccess });
		} else {
			createProject.mutate(data, { onSuccess });
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
			<h2 className="text-2xl font-bold">{isEditing ? 'Edit Project' : 'Create Project'}</h2>

			<div>
				<label className="block text-sm font-medium">Name</label>
				<Input type="text" {...form.register('name')} />
				{form.formState.errors.name && (
					<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium">Description</label>
				<Input type="text" {...form.register('description')} />
				{form.formState.errors.description && (
					<p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
				)}
			</div>

			<Button type="submit" disabled={isSaving}>
				{isSaving ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
			</Button>
		</form>
	);
}
