'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useProfileService } from '@/app/hooks/useProfileService';
import { ProfileSchema } from '@/app/schemas/profileSchema';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileData extends ProfileSchema {
	id: string;
	metadata?: Record<string, unknown>;
}

export default function OrgMemberProfilePage() {
	const { user, isLoaded } = useUser();
	const { useGetProfile, useUpdateProfile } = useProfileService();
	const { data: profile, isLoading, error } = useGetProfile() as { 
		data: ProfileData | undefined; 
		isLoading: boolean; 
		error: Error | null; 
	};
	const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
	
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<Partial<ProfileSchema>>({
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: '',
		organizationName: '',
	});

	// Initialize form data when profile loads
	useEffect(() => {
		if (profile) {
			setFormData({
				firstName: profile.firstName || '',
				lastName: profile.lastName || '',
				email: profile.email || '',
				phoneNumber: profile.phoneNumber || '',
				organizationName: profile.organizationName || '',
			});
		}
	}, [profile]);

	const handleSave = () => {
		updateProfile(formData, {
			onSuccess: () => {
				setIsEditing(false);
			}
		});
	};

	const handleCancel = () => {
		// Reset form to original values
		if (profile) {
			setFormData({
				firstName: profile.firstName || '',
				lastName: profile.lastName || '',
				email: profile.email || '',
				phoneNumber: profile.phoneNumber || '',
				organizationName: profile.organizationName || '',
			});
		}
		setIsEditing(false);
	};

	// Loading state
	if (!isLoaded || isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-4 w-64 mt-2" />
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<Skeleton className="h-96 lg:col-span-1" />
					<Skeleton className="h-96 lg:col-span-2" />
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					Failed to load profile: {error.message || 'Unknown error'}
				</AlertDescription>
			</Alert>
		);
	}

	// No user state
	if (!user) {
		return (
			<Alert variant="destructive">
				<AlertDescription>Please sign in to view your profile.</AlertDescription>
			</Alert>
		);
	}

	const displayName = `${formData.firstName || user.firstName || ''} ${formData.lastName || user.lastName || ''}`.trim() || 'User';
	const displayEmail = formData.email || user.emailAddresses[0]?.emailAddress || '';
	const displayPhone = formData.phoneNumber || '';
	const displayLocation = (profile?.metadata?.location as string) || 'Not specified';
	const displayDepartment = (profile?.metadata?.department as string) || 'Not specified';
	const displayRole = (profile?.metadata?.role as string) || 'Member';
	const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Profile</h1>
					<p className="text-muted-foreground">
						Manage your personal information and preferences
					</p>
				</div>
				<div className="flex gap-2">
					{isEditing ? (
						<>
							<Button onClick={handleSave} size="sm" disabled={isSaving}>
								<Save className="h-4 w-4 mr-2" />
								{isSaving ? 'Saving...' : 'Save Changes'}
							</Button>
							<Button variant="outline" onClick={handleCancel} size="sm" disabled={isSaving}>
								<X className="h-4 w-4 mr-2" />
								Cancel
							</Button>
						</>
					) : (
						<Button onClick={() => setIsEditing(true)} size="sm">
							<Edit className="h-4 w-4 mr-2" />
							Edit Profile
						</Button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Profile Card */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<Avatar className="h-24 w-24">
									<AvatarImage src={user.imageUrl} alt={displayName} />
									<AvatarFallback>
										{displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</div>
							<CardTitle className="text-xl">{displayName}</CardTitle>
							<p className="text-muted-foreground">{displayRole}</p>
							<div className="flex justify-center mt-2">
								<Badge variant="secondary">{displayDepartment}</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3 text-sm">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span>{displayEmail}</span>
							</div>
							{displayPhone && (
								<div className="flex items-center gap-3 text-sm">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span>{displayPhone}</span>
								</div>
							)}
							<div className="flex items-center gap-3 text-sm">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<span>{displayLocation}</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span>Joined {joinDate}</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Edit Form */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Personal Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										value={formData.firstName || ''}
										onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
										disabled={!isEditing}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={formData.lastName || ''}
										onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
										disabled={!isEditing}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={formData.email || ''}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									disabled={!isEditing}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									value={formData.phoneNumber || ''}
									onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
									disabled={!isEditing}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="organization">Organization</Label>
								<Input
									id="organization"
									value={formData.organizationName || ''}
									onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
									disabled={!isEditing}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Preferences Card */}
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Preferences</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">Email Notifications</p>
									<p className="text-xs text-muted-foreground">
										Receive email updates about projects and activities
									</p>
								</div>
								<input
									type="checkbox"
									className="rounded border-gray-300"
									defaultChecked
									disabled={!isEditing}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">Project Updates</p>
									<p className="text-xs text-muted-foreground">
										Get notified when projects you&apos;re involved in are updated
									</p>
								</div>
								<input
									type="checkbox"
									className="rounded border-gray-300"
									defaultChecked
									disabled={!isEditing}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">Team Messages</p>
									<p className="text-xs text-muted-foreground">
										Receive messages from team members
									</p>
								</div>
								<input
									type="checkbox"
									className="rounded border-gray-300"
									defaultChecked
									disabled={!isEditing}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
} 