'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
	Search, 
	Filter, 
	Calendar, 
	Users, 
	FolderOpen,
	Clock,
	CheckCircle,
	Star,
	MessageSquare
} from 'lucide-react';

export default function OrgMemberProjectsPage() {
	const myProjects = [
		{
			id: 1,
			name: 'Website Redesign',
			description: 'Complete redesign of the company website with modern UI/UX',
			status: 'active',
			progress: 75,
			dueDate: '2024-03-15',
			members: 8,
			priority: 'high',
			myRole: 'Frontend Developer',
			myTasks: 5,
			completedTasks: 3
		},
		{
			id: 2,
			name: 'Mobile App Development',
			description: 'iOS and Android app for customer engagement',
			status: 'planning',
			progress: 25,
			dueDate: '2024-05-20',
			members: 12,
			priority: 'medium',
			myRole: 'UI/UX Designer',
			myTasks: 8,
			completedTasks: 2
		},
		{
			id: 3,
			name: 'Database Migration',
			description: 'Migrate legacy database to cloud infrastructure',
			status: 'completed',
			progress: 100,
			dueDate: '2024-02-28',
			members: 5,
			priority: 'high',
			myRole: 'Backend Developer',
			myTasks: 12,
			completedTasks: 12
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
					<h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
					<p className="text-muted-foreground">
						View and manage projects you&apos;re working on
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">My Projects</p>
								<p className="text-2xl font-bold">{myProjects.length}</p>
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
									{myProjects.filter(p => p.status === 'active').length}
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
								<p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
								<p className="text-2xl font-bold text-blue-600">
									{myProjects.reduce((sum, p) => sum + p.myTasks, 0)}
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
									{myProjects.reduce((sum, p) => sum + p.completedTasks, 0)}
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
								placeholder="Search my projects..."
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
				{myProjects.map((project) => (
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
									<Star className="h-4 w-4" />
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
									<span>My Progress</span>
									<span>{Math.round((project.completedTasks / project.myTasks) * 100)}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-blue-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${(project.completedTasks / project.myTasks) * 100}%` }}
									></div>
								</div>
								<p className="text-xs text-muted-foreground">
									{project.completedTasks} of {project.myTasks} tasks completed
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Project Progress</span>
									<span>{project.progress}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-green-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${project.progress}%` }}
									></div>
								</div>
							</div>

							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Users className="h-4 w-4" />
									<span>My Role: {project.myRole}</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Calendar className="h-4 w-4" />
									<span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
								</div>
							</div>

							<div className="flex gap-2">
								<Button variant="outline" size="sm" className="flex-1">
									View Details
								</Button>
								<Button size="sm" className="flex-1">
									<MessageSquare className="h-4 w-4 mr-1" />
									Chat
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm">Task &quot;Update navigation menu&quot; completed in Website Redesign</p>
								<p className="text-xs text-muted-foreground">2 hours ago</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm">New task assigned: &quot;Design mobile app wireframes&quot;</p>
								<p className="text-xs text-muted-foreground">1 day ago</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm">Project &quot;Database Migration&quot; marked as completed</p>
								<p className="text-xs text-muted-foreground">3 days ago</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 