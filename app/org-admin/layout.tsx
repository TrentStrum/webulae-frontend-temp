'use client';

import type { ReactNode } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { OrgAdminSidebar } from '@/app/components/org-admin/OrgAdminSidebar';
import { WhiteLabelHeader } from '@/app/components/ui/WhiteLabelHeader';
import ErrorBoundary from '@/app/ErrorBoundary';

// Separate component for the actual layout functionality
function OrgAdminLayoutContent({ children }: { children: ReactNode }) {
	const { organization } = useOrganization();

	if (!organization) {
		redirect('/select-organization');
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800 h-screen">
			<OrgAdminSidebar organization={organization} />
			<div className="flex-1 flex flex-col overflow-hidden">
				<WhiteLabelHeader />
				<main className="flex-1 p-6 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}

export default function OrgAdminLayout({ children }: { children: ReactNode }) {
	const { isLoaded } = useOrganization();

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<OrgAdminLayoutContent>{children}</OrgAdminLayoutContent>
		</ErrorBoundary>
	);
} 