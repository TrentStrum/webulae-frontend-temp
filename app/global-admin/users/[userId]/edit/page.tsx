'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserService } from '@/app/hooks/useUserService';
import { profileSchema, type ProfileSchema } from '@/app/schemas/profileSchema';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/app/components/ui/form';
import { User, Mail, UserCheck, Building2, Phone, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface User extends ProfileSchema {
	id: string;
}

export default function EditUserPage(): React.ReactElement {
	const router = useRouter();
	const { userId } = useParams<{ userId: string }>();
	const { useGetUserById, useUpdateProfile } = useUserService();
	const {
		data: user,
		isPending,
		isError,
	} = useGetUserById(userId ?? '') as {
		data: User | undefined;
		isPending: boolean;
		isError: boolean;
	};
	const { mutate: updateUser, isPending: isSaving } = useUpdateProfile();

	const form = useForm<ProfileSchema>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			username: '',
			organizationName: '',
			phoneNumber: '',
			imageUrl: '',
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				username: user.username,
				organizationName: user.organizationName,
				phoneNumber: user.phoneNumber,
				imageUrl: user.imageUrl,
			});
		}
	}, [user, form]);

	if (isPending) {
		return (
			<div className="container mx-auto py-6">
				<div className="space-y-4">
					<Skeleton className="h-8 w-[200px]" />
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
				</div>
			</div>
		);
	}

	if (isError || !user) {
		return (
			<div className="container mx-auto py-6">
				<p className="text-red-500">Failed to load user data.</p>
			</div>
		);
	}

	const onSubmit = (data: ProfileSchema): void => {
		updateUser({ userId: userId ?? '', ...data }, { onSuccess: () => router.push('/global-admin/users') });
	};

	return (
		<div className="container mx-auto py-6 max-w-4xl">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
					<p className="text-muted-foreground">
						Update user profile information and settings
					</p>
				</div>
				<Button variant="outline" onClick={() => router.push(`/global-admin/users/${userId}`)}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to User Details
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						User Profile
					</CardTitle>
					<CardDescription>
						Update the user's personal information and account details
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Avatar Section */}
					<div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
						<Avatar className="h-20 w-20">
							<AvatarImage src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} />
							<AvatarFallback className="text-lg font-semibold">
								{user.firstName?.[0]}{user.lastName?.[0]}
							</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
							<p className="text-muted-foreground">{user.email}</p>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Name Fields */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-2">
												<User className="h-4 w-4" />
												First Name
											</FormLabel>
											<FormControl>
												<Input placeholder="Enter first name" {...field} />
											</FormControl>
											<FormDescription>
												The user's first name as it will appear in the system.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-2">
												<User className="h-4 w-4" />
												Last Name
											</FormLabel>
											<FormControl>
												<Input placeholder="Enter last name" {...field} />
											</FormControl>
											<FormDescription>
												The user's last name as it will appear in the system.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Email Field */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<Mail className="h-4 w-4" />
											Email Address
										</FormLabel>
										<FormControl>
											<Input 
												type="email" 
												placeholder="user@example.com" 
												{...field} 
											/>
										</FormControl>
										<FormDescription>
											The user's primary email address for account communications.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Username Field */}
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<UserCheck className="h-4 w-4" />
											Username
										</FormLabel>
										<FormControl>
											<Input 
												placeholder="username" 
												{...field} 
												onChange={(e) => {
													// Remove spaces and special characters
													const value = e.target.value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
													field.onChange(value);
												}}
											/>
										</FormControl>
										<FormDescription>
											Unique username for the user. Only letters, numbers, hyphens, and underscores allowed.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Organization Field */}
							<FormField
								control={form.control}
								name="organizationName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<Building2 className="h-4 w-4" />
											Organization Name
										</FormLabel>
										<FormControl>
											<Input 
												placeholder="Enter organization name" 
												{...field} 
											/>
										</FormControl>
										<FormDescription>
											The organization this user belongs to (optional).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Phone Number Field */}
							<FormField
								control={form.control}
								name="phoneNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<Phone className="h-4 w-4" />
											Phone Number
										</FormLabel>
										<FormControl>
											<Input 
												type="tel" 
												placeholder="+1 (555) 123-4567" 
												{...field} 
											/>
										</FormControl>
										<FormDescription>
											The user's contact phone number (optional).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Profile Image URL Field */}
							<FormField
								control={form.control}
								name="imageUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<ImageIcon className="h-4 w-4" />
											Profile Image URL
										</FormLabel>
										<FormControl>
											<Input 
												type="url" 
												placeholder="https://example.com/avatar.jpg" 
												{...field} 
											/>
										</FormControl>
										<FormDescription>
											URL to the user's profile image (optional).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Action Buttons */}
							<div className="flex justify-end space-x-4 pt-6 border-t">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push('/global-admin/users')}
									disabled={isSaving}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSaving}>
									{isSaving ? 'Saving...' : 'Update User'}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
