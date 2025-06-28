'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useProjectService } from '@/app/hooks/admin/useProjectService';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProjectsPage(): React.ReactElement {
	const router = useRouter();
	const { useGetProjects, useDeleteProject } = useProjectService();
	const { data: projects, isPending, isError } = useGetProjects();
	const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

	if (isPending) {
		return <div>Loading projects...</div>;
	}

	if (isError || !projects) {
		return <div>Error loading projects</div>;
	}

	return (
		<div className="container mx-auto py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Projects</h1>
				<Button variant="outline" onClick={() => router.push('/global-admin/projects/new')}>
					<Plus className="h-4 w-4 mr-2" />
					New Project
				</Button>
			</div>

			{projects.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="text-muted-foreground mb-4">No projects found</p>
						<Button onClick={() => router.push('/global-admin/projects/new')} className="gap-2">
							<Plus className="h-4 w-4" />
							Create Your First Project
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{projects.map((project) => (
						<Card key={project.projectId}>
							<CardHeader>
								<CardTitle className="flex justify-between items-center">
									{project.name}
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => router.push('/global-admin/projects/new')}
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
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">{project.description}</p>
								<div className="mt-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => router.push(`/global-admin/projects/${project.projectId}`)}
									>
										View Details
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
