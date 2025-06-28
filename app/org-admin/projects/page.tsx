'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { 
	Search, 
	Plus, 
	Filter, 
	MoreVertical, 
	Calendar, 
	Users, 
	FolderOpen,
	Clock,
	CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function OrgAdminProjectsPage() {
	const projects = [
		{
			id: 1,
			name: 'Website Redesign',
			description: 'Complete redesign of the company website with modern UI/UX',
			status: 'active',
			progress: 75,
			dueDate: '2024-03-15',
			members: 8,
			priority: 'high'
		},
		{
			id: 2,
			name: 'Mobile App Development',
			description: 'iOS and Android app for customer engagement',
			status: 'planning',
			progress: 25,
			dueDate: '2024-05-20',
			members: 12,
			priority: 'medium'
		},
		{
			id: 3,
			name: 'Database Migration',
			description: 'Migrate legacy database to cloud infrastructure',
			status: 'completed',
			progress: 100,
			dueDate: '2024-02-28',
			members: 5,
			priority: 'high'
		},
		{
			id: 4,
			name: 'Marketing Campaign',
			description: 'Q2 marketing campaign for new product launch',
			status: 'active',
			progress: 60,
			dueDate: '2024-04-10',
			members: 6,
			priority: 'medium'
		}
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'planning': return 'bg-blue-100 text-blue-800';
			case 'completed': return 'bg-gray-100 text-gray-800';
			case 'on-hold': return 'bg-yellow-100 text-yellow-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high': return 'bg-red-100 text-red-800';
			case 'medium': return 'bg-yellow-100 text-yellow-800';
			case 'low': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Projects</h1>
					<p className="text-muted-foreground">
						Manage and track all organization projects
					</p>
				</div>
				<Button asChild>
					<Link href="/org-admin/projects/new">
						<Plus className="h-4 w-4 mr-2" />
						New Project
					</Link>
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Projects</p>
								<p className="text-2xl font-bold">{projects.length}</p>
							</div>
							<FolderOpen className="h-8 w-8 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Active</p>
								<p className="text-2xl font-bold text-green-600">
									{projects.filter(p => p.status === 'active').length}
								</p>
							</div>
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Planning</p>
								<p className="text-2xl font-bold text-blue-600">
									{projects.filter(p => p.status === 'planning').length}
								</p>
							</div>
							<Clock className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Completed</p>
								<p className="text-2xl font-bold text-gray-600">
									{projects.filter(p => p.status === 'completed').length}
								</p>
							</div>
							<CheckCircle className="h-8 w-8 text-gray-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search projects..."
								className="pl-10"
							/>
						</div>
						<Button variant="outline">
							<Filter className="h-4 w-4 mr-2" />
							Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Projects Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{projects.map((project) => (
					<Card key={project.id} className="hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<CardTitle className="text-lg">{project.name}</CardTitle>
									<p className="text-sm text-muted-foreground mt-1">
										{project.description}
									</p>
								</div>
								<Button variant="ghost" size="sm">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Badge className={getStatusColor(project.status)}>
									{project.status.charAt(0).toUpperCase() + project.status.slice(1)}
								</Badge>
								<Badge className={getPriorityColor(project.priority)}>
									{project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
								</Badge>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Progress</span>
									<span>{project.progress}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-blue-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${project.progress}%` }}
									></div>
								</div>
							</div>

							<div className="flex justify-between items-center text-sm text-muted-foreground">
								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									<span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
								</div>
								<div className="flex items-center gap-1">
									<Users className="h-4 w-4" />
									<span>{project.members}</span>
								</div>
							</div>

							<div className="flex gap-2">
								<Button variant="outline" size="sm" className="flex-1">
									View Details
								</Button>
								<Button size="sm" className="flex-1">
									Edit
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
} 