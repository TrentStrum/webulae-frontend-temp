'use client';

import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Building, UserCheck } from 'lucide-react';

export default function AccountPage(): React.ReactElement {
	const { organization, membership } = useOrganization();

	return (
		<main className="max-w-5xl mx-auto py-12 px-4 space-y-8">
			{organization && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building className="h-5 w-5 text-muted-foreground" />
							Organization Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-4">
							<p className="font-medium w-32">Organization Name:</p>
							<p className="text-muted-foreground">{organization.name}</p>
						</div>
						<div className="flex items-center gap-4">
							<p className="font-medium w-32">Your Role:</p>
							<p className="text-muted-foreground capitalize flex items-center gap-2">
								<UserCheck className="h-4 w-4" />
								{membership?.role.replace('org:', '')}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
			<Card>
				<CardHeader>
					<CardTitle>User Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<p>User profile component temporarily removed for debugging.</p>
				</CardContent>
			</Card>
		</main>
	);
}
