'use client';

import { useGetUsers, useDeleteUser } from '@/app/hooks/useUserProfile';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';

export function AdminUserTable(): React.ReactElement {
	const { data: users, isPending, isError } = useGetUsers();
	const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

	if (isPending) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
			</div>
		);
	}

	if (isError || !users) {
		return <p className="text-red-500">Failed to load users.</p>;
	}

	return (
		<div className="overflow-x-auto border rounded-xl shadow p-4">
			<table className="min-w-full text-sm">
				<thead className="bg-gray-100 dark:bg-gray-800">
					<tr>
						<th className="text-left p-2">Name</th>
						<th className="text-left p-2">Email</th>
						<th className="text-left p-2">Created At</th>
						<th className="text-left p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map(user => (
						<tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
							<td className="p-2">{user.name}</td>
							<td className="p-2">{user.email}</td>
							<td className="p-2">{new Date(user.createdAt || '').toLocaleDateString()}</td>
							<td className="p-2 space-x-2">
								<Button size="sm" variant="outline" disabled>
									Edit
								</Button>
								<Button
									size="sm"
									variant="destructive"
									disabled={isDeleting}
									onClick={() => deleteUser(user.id)}
								>
									Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
