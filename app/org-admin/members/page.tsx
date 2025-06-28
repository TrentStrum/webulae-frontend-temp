'use client';

import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

export default function OrgMembersPage() {
	const { organization } = useOrganization();

	if (!organization) {
		return <div>No organization selected</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Manage Members
					</h1>
					<p className="text-muted-foreground">
						Manage organization members and their permissions
					</p>
				</div>
				<Button>
					<UserPlus className="mr-2 h-4 w-4" />
					Add Member
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Organization Members
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<p className="text-muted-foreground">
							Member management functionality coming soon...
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							You&apos;ll be able to add, remove, and manage member permissions here.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 