'use client';

import { useOrganizationList, useOrganization, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';
import Link from 'next/link';

// Function to get the appropriate dashboard link based on user role
const getDashboardLink = (user: any) => {
	const userRole = user?.publicMetadata?.role;
	const orgRole = user?.organizationMemberships?.[0]?.role;
	
	// If user is global admin, go to global admin dashboard
	if (userRole === 'global_admin' || userRole === 'admin') {
		return '/global-admin';
	}
	
	// If user is org admin, go to org admin dashboard
	if (orgRole === 'org:admin') {
		return '/org-admin';
	}
	
	// Default to regular dashboard
	return '/dashboard';
};

export default function SelectOrganizationPage() {
	const { organizationList, isLoaded } = useOrganizationList();
	const { setActive } = useOrganization();
	const { user } = useUser();

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	const handleSelectOrganization = async (orgId: string) => {
		await setActive({ organization: orgId });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="max-w-md w-full space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Select Organization</h1>
					<p className="text-muted-foreground mt-2">
						Choose an organization to continue
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Your Organizations
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{organizationList?.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-muted-foreground mb-4">
									You don't have any organizations yet.
								</p>
								<Link href="/create-organization">
									<Button>
										<Plus className="mr-2 h-4 w-4" />
										Create Organization
									</Button>
								</Link>
							</div>
						) : (
							<div className="space-y-3">
								{organizationList?.map((org) => (
									<Button
										key={org.organization.id}
										variant="outline"
										className="w-full justify-start h-auto p-4"
										onClick={() => handleSelectOrganization(org.organization.id)}
									>
										<div className="flex items-center gap-3">
											{org.organization.imageUrl ? (
												<img
													src={org.organization.imageUrl}
													alt={org.organization.name}
													className="w-8 h-8 rounded-full"
												/>
											) : (
												<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
													{org.organization.name.charAt(0).toUpperCase()}
												</div>
											)}
											<div className="text-left">
												<div className="font-medium">
													{org.organization.name}
												</div>
												<div className="text-sm text-muted-foreground">
													{org.role}
												</div>
											</div>
										</div>
									</Button>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<div className="text-center">
					<Link href={getDashboardLink(user)}>
						<Button variant="ghost">
							Back to Dashboard
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
} 