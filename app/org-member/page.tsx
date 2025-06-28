'use client';

import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, FileText, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { OrganizationDocumentList } from '@/app/components/organization/OrganizationDocumentList';
import { useOrganizationMetrics } from '@/app/hooks/useOrganizationMetrics';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrgMemberPage() {
	const { organization } = useOrganization();
	const { data: metrics, isPending, isError } = useOrganizationMetrics(organization?.id || '');

	if (!organization) {
		return <div>No organization selected</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Member Dashboard
					</h1>
					<p className="text-muted-foreground">
						Welcome to your organization workspace
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">My Projects</CardTitle>
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
								<p className="text-xs text-muted-foreground">
									Active projects
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Documents</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isPending ? (
							<Skeleton className="h-8 w-16" />
						) : isError ? (
							<div className="text-2xl font-bold text-red-500">Error</div>
						) : (
							<>
								<div className="text-2xl font-bold">{metrics?.totalDocuments || 0}</div>
								<p className="text-xs text-muted-foreground">
									Shared documents
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Team Members</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isPending ? (
							<Skeleton className="h-8 w-16" />
						) : isError ? (
							<div className="text-2xl font-bold text-red-500">Error</div>
						) : (
							<>
								<div className="text-2xl font-bold">
									{metrics?.memberCount || organization.membersCount || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									Organization members
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Projects</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isPending ? (
							<Skeleton className="h-8 w-16" />
						) : isError ? (
							<div className="text-2xl font-bold text-red-500">Error</div>
						) : (
							<>
								<div className="text-2xl font-bold">{metrics?.projectCount || 0}</div>
								<p className="text-xs text-muted-foreground">
									Organization projects
								</p>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<div className="col-span-4">
					<OrganizationDocumentList />
				</div>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">Project &quot;Website Redesign&quot; updated</p>
									<p className="text-xs text-muted-foreground">1 hour ago</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">New document shared</p>
									<p className="text-xs text-muted-foreground">3 hours ago</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">Team meeting scheduled</p>
									<p className="text-xs text-muted-foreground">1 day ago</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 