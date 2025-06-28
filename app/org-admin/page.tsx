'use client';

import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, Settings, BarChart3, Shield } from 'lucide-react';
import Link from 'next/link';
import { OrganizationDocumentList } from '@/app/components/organization/OrganizationDocumentList';
import { useOrganizationMetrics } from '@/app/hooks/useOrganizationMetrics';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrgAdminPage() {
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
						Admin Dashboard
					</h1>
					<p className="text-muted-foreground">
						Manage your organization&apos;s members, projects, and settings
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Members</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
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
									Active organization members
								</p>
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
								<p className="text-xs text-muted-foreground">
									Projects in progress
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Documents</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
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
						<CardTitle className="text-sm font-medium">Policy Bot</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<Link href="/org-admin/policy-bot">
							<Button variant="outline" className="w-full">
								Generate Policies
							</Button>
						</Link>
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
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">New member joined</p>
									<p className="text-xs text-muted-foreground">2 hours ago</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">Project updated</p>
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