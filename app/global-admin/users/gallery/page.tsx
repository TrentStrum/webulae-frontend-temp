'use client';

import { useUserService } from '@/app/hooks/useUserService';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import type { User } from '@/app/types/user.types';

// Separate component for the actual gallery functionality
function UserGalleryContent({ users, isPending, isError, isDeleting, deleteUser }: {
	users: User[] | undefined;
	isPending: boolean;
	isError: boolean;
	isDeleting: boolean;
	deleteUser: (id: string) => void;
}) {
	const router = useRouter();

	if (isPending) return <p>Loading users...</p>;
	if (isError || !users) return <p>Failed to load users.</p>;

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">User Gallery</h2>
				<Button variant="secondary" onClick={() => router.push('/global-admin/users')}>
					Switch to Table View
				</Button>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{users.map((user: User) => (
					<Card key={user.id} className="p-4">
						<CardContent className="space-y-2">
							<p className="text-lg font-semibold">{user.name}</p>
							<p className="text-sm text-muted-foreground">{user.email}</p>
							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => router.push(`/global-admin/users/${user.id}`)}
								>
									Edit
								</Button>
								<Button
									size="sm"
									variant="danger"
									disabled={isDeleting}
									onClick={() => deleteUser(user.id)}
								>
									Delete
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export default function AdminUsersGalleryPage(): React.ReactElement {
	const { useGetUsers, useDeleteUser } = useUserService();
	const { data: users, isPending, isError } = useGetUsers() as { 
		data: User[] | undefined; 
		isPending: boolean; 
		isError: boolean; 
	};
	const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

	return (
		<UserGalleryContent 
			users={users}
			isPending={isPending}
			isError={isError}
			isDeleting={isDeleting}
			deleteUser={deleteUser}
		/>
	);
}
