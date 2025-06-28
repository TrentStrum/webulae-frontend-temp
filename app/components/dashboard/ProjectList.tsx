'use client';
import React, { memo } from 'react';
import { useProjectService } from '@/app/hooks/admin/useProjectService';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderIcon, CalendarIcon, ExternalLinkIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Project } from '@/app/types';

// Memoized project item component to prevent unnecessary re-renders
const ProjectItem = memo(({ project }: { project: Project }) => (
  <div
    className="group relative rounded-lg border p-4 hover:border-primary/50 transition-colors"
  >
    <div className="flex items-start gap-4">
      <div className="mt-1">
        <FolderIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-semibold group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || 'No description provided'}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" aria-hidden="true" />
            <span>Created {new Date(project.createdAt || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/projects/${project.projectId}`} aria-label={`View ${project.name} details`}>
          <ExternalLinkIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  </div>
));

ProjectItem.displayName = 'ProjectItem';

export default function ProjectList(): React.ReactElement {
  const { useGetProjects } = useProjectService();
  const { data: projects, isPending, isError, error } = useGetProjects();

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading projects">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6" role="alert" aria-live="assertive">
        <p className="text-red-500">Failed to load projects: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!projects?.length) {
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
              Get started by creating your first project. You can organize your work, track progress, and collaborate with your team.
            </p>
            <Button asChild className="gap-2">
              <Link href="/request">
                <PlusIcon className="h-4 w-4" />
                Create your first project
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <span className="text-sm text-muted-foreground">{projects.length} total</span>
      </div>
      
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectItem key={project.projectId} project={project} />
        ))}
      </div>
    </div>
  );
}