'use client';

import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { 
	IconBrandTabler, 
	IconFileText, 
	IconFolder, 
	IconUser,
	IconArrowLeft 
} from '@tabler/icons-react';
import Image from 'next/image';
import { OrganizationResource } from '@clerk/types';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
	LayoutDashboard,
	User,
	Briefcase,
	MessageSquare,
	FileText,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface OrgMemberSidebarProps {
	organization: OrganizationResource;
}

export function OrgMemberSidebar({ organization }: OrgMemberSidebarProps) {
	const { user } = useUser();

	// Function to get the appropriate main dashboard link based on user role
	const getMainDashboardLink = () => {
		const userRole = user?.publicMetadata?.role;
		const orgRole = user?.organizationMemberships?.[0]?.role;
		
		// If user is global admin, go to global admin dashboard
		if (userRole === 'global_admin' || userRole === 'admin') {
			return '/global-admin';
		}
		
		// If user is org admin, go to org admin dashboard
		if (orgRole === 'org:admin') {
			return '/org-admin';
		}
		
		// Default to regular dashboard
		return '/dashboard';
	};

	const links = [
		{
			label: "Dashboard",
			href: "/org-member",
			icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "Projects",
			href: "/org-member/projects",
			icon: <IconFolder className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
		},
		{
			label: "My Profile",
			href: "/org-member/profile",
			icon: <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
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
									<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
										{organization.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div>
									<p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
										{organization.name}
									</p>
									<p className="text-xs text-neutral-500 dark:text-neutral-400">
										Member
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
				
				{/* Back to Main */}
				<div>
					<SidebarLink
						link={{
							label: "Back to Main",
							href: getMainDashboardLink(),
							icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
						}}
					/>
				</div>
			</SidebarBody>
		</Sidebar>
	);
} 