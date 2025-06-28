'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUserService } from '@/app/hooks/useUserService';
import { Button } from '@/app/components/ui/button';

interface User {
	id: string;
	name: string;
	email: string;
	businessName?: string;
}

export default function UserPage(): React.ReactElement {
	const router = useRouter();
	const { userId } = useParams<{ userId: string }>();
	const { useGetUserById } = useUserService();
	const { data: user, isPending, isError } = useGetUserById(userId ?? '') as { data: User | undefined, isPending: boolean, isError: boolean };

	if (isPending) {
		return <div>Loading...</div>;
	}

	if (isError || !user) {
		return <div>Error loading user</div>;
	}

	return (
		<div className="container mx-auto py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">User Details</h1>
				<div className="space-x-2">
					<Button onClick={() => router.push(`/global-admin/users/${userId}/edit`)}>Edit User</Button>
					<Button variant="outline" onClick={() => router.push('/global-admin/users')}>
						Back to Users
					</Button>
				</div>
			</div>

			<div className="space-y-4">
				<div>
					<h3 className="font-medium">Name</h3>
					<p>{user.name}</p>
				</div>
				<div>
					<h3 className="font-medium">Email</h3>
					<p>{user.email}</p>
				</div>
				{user.businessName && (
					<div>
						<h3 className="font-medium">Business Name</h3>
						<p>{user.businessName}</p>
					</div>
				)}
			</div>
		</div>
	);
}
