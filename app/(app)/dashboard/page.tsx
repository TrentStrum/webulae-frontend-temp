import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import Metrics from './Metrics';
import ChatInterface from '@/app/components/dashboard/ChatInterface';
import ProjectList from '@/app/components/dashboard/ProjectList';
import WorkflowExecutions from '@/app/components/dashboard/WorkflowExecutions';
import DocumentList from '@/app/components/dashboard/DocumentList';
import PolicyBotCard from '@/app/components/dashboard/PolicyBotCard';
import { Card } from '@/components/ui/card';

export default async function DashboardPage(): Promise<React.ReactElement> {
	const { userId, sessionClaims, orgRole } = await auth();

	if (!userId) {
		redirect('/sign-in');
	}

	// Check if user is a global admin and redirect them to global admin dashboard
	const userRole = sessionClaims?.metadata?.role;
	const isGlobalAdmin = userRole === 'global_admin' || userRole === 'admin';
	if (isGlobalAdmin) {
		redirect('/global-admin');
	}

	// Check if user is an org admin and redirect them to org admin dashboard
	const isOrgAdmin = orgRole === 'org:admin' || sessionClaims?.org_role === 'org:admin';
	if (isOrgAdmin) {
		redirect('/org-admin');
	}

	return (
		<main className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4 space-y-8">
				<div className="flex flex-col space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground text-lg">Welcome to your Webulae workspace. Here&apos;s an overview of your activities.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Metrics Section */}
					<Card className="p-6 col-span-full lg:col-span-2">
						<Metrics />
					</Card>

					{/* Projects Section */}
					<Card className="p-6 col-span-full lg:col-span-1">
						<ProjectList />
					</Card>

					{/* Workflow Executions Section */}
					<Card className="p-6 col-span-full lg:col-span-2">
						<WorkflowExecutions />
					</Card>

					{/* Documents Section */}
					<Card className="p-6 col-span-full lg:col-span-1">
						<DocumentList />
					</Card>

					{/* Policy Bot Section */}
					<Card className="p-6 col-span-full lg:col-span-1">
						<PolicyBotCard />
					</Card>
				</div>
			</div>
			<ChatInterface />
		</main>
	);
}
