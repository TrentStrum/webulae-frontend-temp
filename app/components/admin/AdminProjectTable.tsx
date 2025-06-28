'use client';

import * as React from 'react';
import { useProjectService } from '@/app/hooks/admin/useProjectService';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { FolderIcon, PlusIcon, Plus, Edit, Trash2 } from 'lucide-react';

export function AdminProjectTable(): React.ReactElement {
	const router = useRouter();
	const { useGetProjects, useDeleteProject } = useProjectService();
	const { data: projects, isPending, isError } = useGetProjects();
	const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

	if (isPending) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-[300px]" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
			</div>
		);
	}

	if (isError || !projects) {
		return <p className="text-red-500">Failed to load projects.</p>;
	}

	if (!projects.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Projects</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
							<FolderIcon className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">No projects at this time</h3>
						<p className="text-muted-foreground mb-6 max-w-sm mx-auto">
							There are no projects in the system yet. Create the first project to get started.
						</p>
						<Button onClick={() => router.push('/global-admin/projects/new')} className="gap-2">
							<PlusIcon className="h-4 w-4" />
							Create first project
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Projects</h2>
				<Button onClick={() => router.push('/global-admin/projects/new')} className="gap-2">
					<Plus className="h-4 w-4" />
					New Project
				</Button>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="border-b text-left">
							<th className="p-2">ID</th>
							<th className="p-2">Name</th>
							<th className="p-2">Description</th>
							<th className="p-2">Status</th>
							<th className="p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{projects.map((project) => (
							<tr key={project.projectId} className="border-b">
								<td className="p-2">{project.projectId}</td>
								<td className="p-2">{project.name}</td>
								<td className="p-2">{project.description}</td>
								<td className="p-2">{project.status}</td>
								<td className="p-2 space-x-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => router.push(`/global-admin/projects/${project.projectId}/edit`)}
									>
										<Edit className="h-4 w-4 mr-1" />
										Edit
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={() => deleteProject(project.projectId)}
										disabled={isDeleting}
									>
										<Trash2 className="h-4 w-4 mr-1" />
										Delete
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
