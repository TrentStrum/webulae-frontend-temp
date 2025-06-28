'use client';

import { useState, useCallback } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { 
	IconBrandTabler, 
	IconUsers, 
	IconFileText, 
	IconFolder, 
	IconSettings,
	IconArrowLeft,
	IconBrain,
	IconMessage,
	IconHelp,
	IconLogout,
	IconUser,
	IconBuilding,
	IconShield,
	IconChartBar
} from '@tabler/icons-react';
import Image from 'next/image';
import { OrganizationResource } from '@clerk/types';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import Link from 'next/link';

interface OrgAdminSidebarProps {
	organization: OrganizationResource;
}

export function OrgAdminSidebar({ organization }: OrgAdminSidebarProps) {
	const { user } = useUser();
	const { signOut } = useClerk();
	const [isOpen, setIsOpen] = useState(false);
	
	const handleSignOut = useCallback(() => signOut(), [signOut]);

	// Function to get the appropriate main dashboard link based on user role
	const getMainDashboardLink = () => {
		const userRole = user?.publicMetadata?.role;
		
		// If user is global admin, go to global admin dashboard
		if (userRole === 'global_admin' || userRole === 'admin') {
			return '/global-admin';
		}
		
		// Default to regular dashboard
		return '/dashboard';
	};

	const links = [
		{
			label: "Dashboard",
			href: "/org-admin",
			icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Members",
			href: "/org-admin/members",
			icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Projects",
			href: "/org-admin/projects",
			icon: <IconFolder className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Documents",
			href: "/org-admin/documents",
			icon: <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Policy Bot",
			href: "/org-admin/policy-bot",
			icon: <IconShield className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Analytics",
			href: "/org-admin/analytics",
			icon: <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Knowledge",
			href: "/org-admin/knowledge",
			icon: <IconBrain className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "System Prompts",
			href: "/org-admin/system-prompts",
			icon: <IconMessage className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "FAQs",
			href: "/org-admin/faqs",
			icon: <IconHelp className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Settings",
			href: "/org-admin/settings",
			icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		}
	];

	return (
		<Sidebar>
			<SidebarBody className="justify-between gap-10">
				<div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
					<div className="mt-8 flex flex-col gap-2">
						{/* Organization Info */}
						<div className="px-4 py-2">
							<div className="flex items-center gap-2 mb-2">
								{organization.imageUrl ? (
									<Image
										src={organization.imageUrl}
										alt={organization.name}
										width={32}
										height={32}
										className="rounded-full"
									/>
								) : (
									<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
										{organization.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div>
									<p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
										{organization.name}
									</p>
									<p className="text-xs text-neutral-500 dark:text-neutral-400">
										Admin
									</p>
								</div>
							</div>
						</div>

						{/* Navigation Links */}
						{links.map((link, idx) => (
							<SidebarLink key={idx} link={link} />
						))}
					</div>
				</div>
				
				{/* User Menu and Back to Main */}
				<div className="space-y-2">
					{/* Back to Main */}
					<SidebarLink
						link={{
							label: "Back to Main",
							href: getMainDashboardLink(),
							icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
						}}
					/>
					
					{/* User Menu */}
					<div className="relative">
						<Button 
							variant="ghost" 
							className="flex items-center gap-2 w-full justify-start p-2 hover:bg-muted rounded-md" 
							onClick={() => setIsOpen(!isOpen)}
						>
							<span className="text-sm text-muted-foreground truncate max-w-[120px]">
								{user?.fullName || 'Account'}
							</span>
							{user?.imageUrl ? (
								<Image 
									src={user.imageUrl} 
									alt={user.fullName || "User"} 
									className="w-8 h-8 rounded-full"
									width={32}
									height={32}
								/>
							) : (
								<Avatar className="w-8 h-8">
									<AvatarFallback className="text-sm">
										{user?.firstName?.[0]}{user?.lastName?.[0]}
									</AvatarFallback>
								</Avatar>
							)}
						</Button>
						{isOpen && (
							<div className="absolute bottom-full left-0 mb-2 w-48 bg-white border rounded-md shadow-lg z-50">
								<div className="p-3 border-b">
									<p className="text-sm font-medium">{user?.fullName}</p>
									<p className="text-xs text-muted-foreground">{user?.emailAddresses?.[0]?.emailAddress}</p>
								</div>
								<Link href="/account" className="flex items-center gap-2 p-2 hover:bg-gray-100">
									<IconUser className="w-4 h-4" />
									Personal Profile
								</Link>
								<Link href="/organization" className="flex items-center gap-2 p-2 hover:bg-gray-100">
									<IconBuilding className="w-4 h-4" />
									Organization Settings
								</Link>
								<Link href="/settings" className="flex items-center gap-2 p-2 hover:bg-gray-100">
									<IconSettings className="w-4 h-4" />
									Settings
								</Link>
								<hr className="my-1" />
								<Link href={getMainDashboardLink()} className="flex items-center gap-2 p-2 hover:bg-gray-100">
									<IconBrandTabler className="w-4 h-4" />
									Back to Dashboard
								</Link>
								<hr className="my-1" />
								<button
									onClick={handleSignOut}
									className="flex items-center gap-2 p-2 hover:bg-gray-100 text-red-600 w-full text-left"
								>
									<IconLogout className="w-4 h-4" />
									Sign out
								</button>
							</div>
						)}
					</div>
				</div>
			</SidebarBody>
		</Sidebar>
	);
} 