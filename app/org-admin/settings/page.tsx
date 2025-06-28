'use client';

import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Settings, Building2 } from 'lucide-react';

export default function OrgSettingsPage() {
	const { organization } = useOrganization();

	if (!organization) {
		return <div>No organization selected</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Organization Settings
					</h1>
					<p className="text-muted-foreground">
						Manage {organization.name} settings and preferences
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Organization Info
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium">Organization Name</label>
							<p className="text-sm text-muted-foreground">{organization.name}</p>
						</div>
						<div>
							<label className="text-sm font-medium">Organization ID</label>
							<p className="text-sm text-muted-foreground">{organization.id}</p>
						</div>
						<Button variant="outline" className="w-full">
							Edit Organization
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Preferences
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								Organization preferences coming soon...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 