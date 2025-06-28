'use client';

import * as React from 'react';
import { useUserAdminService } from '@/app/hooks/admin/useAdminUserService';
import { Skeleton } from '@/app/components/ui/skeleton';
import type { UserProfile } from '@/app/types/user.types';

// Extended UserProfile with role for admin management
interface AdminUser extends UserProfile {
	role: 'admin' | 'user';
}

export function AdminRoleManager(): React.ReactElement {
	const { useGetUsers, useUpdateUserRole } = useUserAdminService();
	const { data: users, isPending, isError } = useGetUsers();
	const { mutate: updateUserRole, isPending: isUpdating } = useUpdateUserRole();

	if (isPending) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-[300px]" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
			</div>
		);
	}

	if (isError || !users) {
		return <p className="text-red-500">Failed to load users.</p>;
	}

	const handleRoleToggle = (user: AdminUser): void => {
		const newRole = user.role === 'admin' ? 'user' : 'admin';
		updateUserRole({ userId: user.id, role: newRole });
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">Role Management</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="border-b text-left">
							<th className="p-2">ID</th>
							<th className="p-2">Name</th>
							<th className="p-2">Email</th>
							<th className="p-2">Role</th>
							<th className="p-2">Toggle Admin</th>
						</tr>
					</thead>
					<tbody>
						{(users as AdminUser[]).map((user) => (
							<tr key={user.id} className="border-b">
								<td className="p-2">{user.id}</td>
								<td className="p-2">{user.name}</td>
								<td className="p-2">{user.email}</td>
								<td className="p-2 capitalize">{user.role ?? 'user'}</td>
								<td className="p-2">
									<input
										type="checkbox"
										checked={user.role === 'admin'}
										onChange={() => handleRoleToggle(user)}
										disabled={isUpdating}
										className="rounded border-gray-300"
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
