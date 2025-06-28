'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectSchema } from '@/app/schemas/projectSchema';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useEffect } from 'react';
import { useProjectService } from '@/app/hooks/admin/useProjectService';

interface Project extends ProjectSchema {
	projectId: string;
}

export default function EditProjectPage(): React.ReactElement {
	const router = useRouter();
	const { projectId } = useParams<{ projectId: string }>();
	const { useGetProjectById, useUpdateProject } = useProjectService();
	const {
		data: project,
		isPending,
		isError,
	} = useGetProjectById(projectId ?? '') as {
		data: Project | undefined;
		isPending: boolean;
		isError: boolean;
	};
	const { mutate: updateProject, isPending: isSaving } = useUpdateProject();

	const form = useForm<ProjectSchema>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			name: '',
			description: '',
			status: 'active',
		},
	});

	useEffect(() => {
		if (project) {
			form.reset({
				name: project.name,
				description: project.description,
				status: project.status,
			});
		}
	}, [project, form]);

	if (isPending) {
		return (
			<div className="container mx-auto py-6">
				<div className="space-y-4">
					<Skeleton className="h-8 w-[200px]" />
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
				</div>
			</div>
		);
	}

	if (isError || !project) {
		return (
			<div className="container mx-auto py-6">
				<p className="text-red-500">Failed to load project data.</p>
			</div>
		);
	}

	const onSubmit = (data: ProjectSchema): void => {
		updateProject(
			{ projectId: projectId ?? '', ...data },
			{ onSuccess: () => router.push('/global-admin/projects') }
		);
	};

	return (
		<div className="container mx-auto py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Edit Project</h1>
				<Button variant="outline" onClick={() => router.push(`/global-admin/projects/${projectId}`)}>
					Back to Project Details
				</Button>
			</div>

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
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
					{isSaving ? 'Saving...' : 'Update Project'}
				</Button>
			</form>
		</div>
	);
}
