'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserService } from '@/app/hooks/useUserService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { UserPlus, Users, Calendar, Mail } from 'lucide-react';
import type { User } from '@/app/types/user.types';

export default function UsersPage() {
	const { useGetUsers } = useUserService();
	const router = useRouter();
	const { data: users, isLoading, isError, error } = useGetUsers() as { 
		data: User[] | undefined; 
		isLoading: boolean; 
		isError: boolean; 
		error: Error | null; 
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(word => word.charAt(0))
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case 'global_admin':
			case 'admin':
			case 'org_admin':
				return 'primary';
			case 'user':
				return 'secondary';
			default:
				return 'secondary';
		}
	};

	if (isError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-6">User Management</h1>
					<div className="bg-red-50 border border-red-200 rounded-lg p-6">
						<p className="text-red-600">
							Failed to load users: {error?.message || 'Unknown error'}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">User Management</h1>
					<p className="text-muted-foreground mt-2">
						Manage all users in the system
					</p>
				</div>
				<Button asLink href="/global-admin/users/new">
					<UserPlus className="w-4 h-4 mr-2" />
					Create User
				</Button>
			</div>

			{isLoading ? (
				<Card>
					<CardHeader>
						<CardTitle>Users</CardTitle>
						<CardDescription>Loading users...</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
									<div className="w-10 h-10 bg-gray-200 rounded-full"></div>
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-gray-200 rounded w-1/4"></div>
										<div className="h-3 bg-gray-200 rounded w-1/3"></div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							Users ({users?.length || 0})
						</CardTitle>
						<CardDescription>
							All registered users in the system
						</CardDescription>
					</CardHeader>
					<CardContent>
						{users && users.length === 0 ? (
							<div className="text-center py-8">
								<Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No Users Found</h3>
								<p className="text-muted-foreground mb-4">
									Get started by creating your first user.
								</p>
								<Button asLink href="/global-admin/users/new">
									<UserPlus className="w-4 h-4 mr-2" />
									Create First User
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b">
											<th className="text-left p-3 font-medium">User</th>
											<th className="text-left p-3 font-medium">Email</th>
											<th className="text-left p-3 font-medium">Role</th>
											<th className="text-left p-3 font-medium">Organization</th>
											<th className="text-left p-3 font-medium">Created</th>
											<th className="text-left p-3 font-medium">Last Sign In</th>
										</tr>
									</thead>
									<tbody>
										{users?.map((user: User) => (
											<tr 
												key={user.id} 
												className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
												onClick={() => router.push(`/global-admin/users/${user.id}/edit`)}
											>
												<td className="p-3">
													<div className="flex items-center space-x-3">
														<Avatar className="w-8 h-8">
															<AvatarImage src="" />
															<AvatarFallback>
																{getInitials(user.name)}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-medium">{user.name}</p>
															<p className="text-sm text-muted-foreground">@{user.username}</p>
														</div>
													</div>
												</td>
												<td className="p-3">
													<div className="flex items-center space-x-1">
														<Mail className="w-4 h-4 text-muted-foreground" />
														<span>{user.email}</span>
													</div>
												</td>
												<td className="p-3">
													<Badge variant={getRoleBadgeVariant(user.role)}>
														{user.role}
													</Badge>
												</td>
												<td className="p-3">
													{user.organizationName || (
														<span className="text-muted-foreground">—</span>
													)}
												</td>
												<td className="p-3">
													<div className="flex items-center space-x-1">
														<Calendar className="w-4 h-4 text-muted-foreground" />
														<span className="text-sm">
															{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
														</span>
													</div>
												</td>
												<td className="p-3">
													<span className="text-muted-foreground text-sm">—</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
