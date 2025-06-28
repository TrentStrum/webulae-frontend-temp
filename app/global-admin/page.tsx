'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, FileText, ClipboardList, TrendingUp, Activity, UserPlus, Shield } from 'lucide-react';
import Link from 'next/link';
import { useGlobalAdminMetrics } from '@/app/hooks/admin/useGlobalAdminMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function formatTrend(trend: number | null | undefined): React.ReactElement {
	if (trend === null || trend === undefined || !isFinite(trend)) {
		return <span className="text-xs text-muted-foreground">No trend data</span>;
	}

	const trendColor = trend > 0 ? 'text-green-500' : 'text-red-500';
	const trendSign = trend > 0 ? '+' : '';

	return (
		<p className={`text-xs ${trendColor}`}>
			{trendSign}
			{trend.toFixed(0)}% from last month
		</p>
	);
}

export default function GlobalAdminPage(): React.ReactElement {
	const { data: metrics, isPending, isError } = useGlobalAdminMetrics();

	return (
		<div className="flex flex-col min-h-screen">
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="/global-admin">
									Global Admin
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Dashboard</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Global Admin Dashboard</h1>
						<p className="text-muted-foreground">
							Manage all users, projects, and system-wide settings
						</p>
					</div>
				</div>

				{/* Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Users</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isPending ? (
								<Skeleton className="h-8 w-16" />
							) : isError ? (
								<div className="text-2xl font-bold text-red-500">Error</div>
							) : (
								<>
									<div className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString() || 0}</div>
									{formatTrend(metrics?.totalUsersTrend)}
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Projects</CardTitle>
							<FolderOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isPending ? (
								<Skeleton className="h-8 w-16" />
							) : isError ? (
								<div className="text-2xl font-bold text-red-500">Error</div>
							) : (
								<>
									<div className="text-2xl font-bold">{metrics?.activeProjects || 0}</div>
									{formatTrend(metrics?.activeProjectsTrend)}
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Published Posts</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isPending ? (
								<Skeleton className="h-8 w-16" />
							) : isError ? (
								<div className="text-2xl font-bold text-red-500">Error</div>
							) : (
								<>
									<div className="text-2xl font-bold">{metrics?.totalPosts || 0}</div>
									{formatTrend(metrics?.totalPostsTrend)}
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Organizations</CardTitle>
							<ClipboardList className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isPending ? (
								<Skeleton className="h-8 w-16" />
							) : isError ? (
								<div className="text-2xl font-bold text-red-500">Error</div>
							) : (
								<>
									<div className="text-2xl font-bold">{metrics?.totalOrganizations || 0}</div>
									{formatTrend(metrics?.totalOrganizationsTrend)}
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Access Requests</CardTitle>
							<UserPlus className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{isPending ? (
								<Skeleton className="h-8 w-16" />
							) : isError ? (
								<div className="text-2xl font-bold text-red-500">Error</div>
							) : (
								<>
									<div className="text-2xl font-bold">{metrics?.pendingAccessRequests || 0}</div>
									<p className="text-xs text-muted-foreground">
										Awaiting review
									</p>
								</>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions and Recent Activity */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Link href="/global-admin/users">
								<Button className="w-full justify-start">
									<Users className="mr-2 h-4 w-4" />
									Manage Users
								</Button>
							</Link>
							<Link href="/global-admin/access-requests">
								<Button className="w-full justify-start" variant="outline">
									<UserPlus className="mr-2 h-4 w-4" />
									Review Access Requests
								</Button>
							</Link>
							<Link href="/global-admin/projects">
								<Button className="w-full justify-start" variant="outline">
									<FolderOpen className="mr-2 h-4 w-4" />
									View Projects
								</Button>
							</Link>
							<Link href="/global-admin/project-requests">
								<Button className="w-full justify-start" variant="outline">
									<ClipboardList className="mr-2 h-4 w-4" />
									Review Project Requests
								</Button>
							</Link>
							<Link href="/global-admin/settings">
								<Button className="w-full justify-start" variant="outline">
									<Activity className="mr-2 h-4 w-4" />
									System Settings
								</Button>
							</Link>
							<Link href="/global-admin/policy-bot">
								<Button className="w-full justify-start" variant="outline">
									<Shield className="mr-2 h-4 w-4" />
									Policy Bot
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm font-medium">New access request submitted</p>
										<p className="text-xs text-muted-foreground">2 minutes ago</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm font-medium">Project &ldquo;E-commerce Platform&rdquo; completed</p>
										<p className="text-xs text-muted-foreground">1 hour ago</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm font-medium">New project request submitted</p>
										<p className="text-xs text-muted-foreground">3 hours ago</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm font-medium">System maintenance completed</p>
										<p className="text-xs text-muted-foreground">1 day ago</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* System Health */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							System Health
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<span className="text-sm font-medium">Database</span>
								<span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<span className="text-sm font-medium">API Services</span>
								<span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<span className="text-sm font-medium">File Storage</span>
								<span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
