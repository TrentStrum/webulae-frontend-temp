'use client';

import { useOrganization } from '@clerk/nextjs';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

export function WhiteLabelHeader() {
	const { organization } = useOrganization();

	if (!organization) {
		return null;
	}

	return (
		<div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{/* Organization Logo */}
					{organization.imageUrl ? (
						<Image
							src={organization.imageUrl}
							alt={organization.name}
							width={40}
							height={40}
							className="rounded-lg"
						/>
					) : (
						<Avatar className="h-10 w-10">
							<AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
								{organization.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					)}
					
					{/* Organization Name */}
					<div>
						<h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
							{organization.name}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Organization Workspace
						</p>
					</div>
				</div>
				
				{/* Optional: Add additional branding elements here */}
				<div className="flex items-center gap-2">
					{/* You can add additional branding elements like:
						- Custom domain indicator
						- Organization status
						- Additional logos or badges
					*/}
				</div>
			</div>
		</div>
	);
} 