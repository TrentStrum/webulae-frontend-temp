'use client';
import React, { memo, useState } from 'react';
import { useProjectService } from '@/app/hooks/admin/useProjectService';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban, Calendar, ExternalLink, Plus, Search, Filter, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Project } from '@/app/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Memoized project item component to prevent unnecessary re-renders
const ProjectItem = memo(({ project }: { project: Project }) => {
  // Calculate random progress for demo purposes
  const progress = Math.floor(Math.random() * 100);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30));
  
  const getStatusBadge = () => {
    const statuses = ['active', 'planning', 'completed', 'on-hold'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
      case 'planning':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Planning</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Completed</Badge>;
      case 'on-hold':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">On Hold</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <Card className="group hover:shadow-md transition-all border-border/50 hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 bg-primary/10 rounded-lg">
            <FolderKanban className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'No description provided'}
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>Due {dueDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>Updated {new Date(project.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3">
            <Link href={`/projects/${project.projectId}`} aria-label={`View ${project.name} details`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ProjectItem.displayName = 'ProjectItem';

export default function ProjectList(): React.ReactElement {
  const { useGetProjects } = useProjectService();
  const { data: projects, isPending, isError, error } = useGetProjects();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter projects based on search term
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (!searchTerm) return projects;
    
    return projects.filter(project => 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading projects">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6 bg-destructive/10 border border-destructive/20 rounded-lg" role="alert" aria-live="assertive">
        <p className="text-destructive">Failed to load projects: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects at this time</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Get started by creating your first project. You can organize your work, track progress, and collaborate with your team.
            </p>
            <Button asChild className="gap-2">
              <Link href="/request">
                <Plus className="h-4 w-4" />
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{projects.length} total</span>
          <Button size="sm" variant="outline" asChild>
            <Link href="/request">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {filteredProjects.map((project) => (
            <ProjectItem key={project.projectId} project={project} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}