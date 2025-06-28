'use client'

import { useState, useCallback } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { 
  IconBrandTabler, 
  IconUsers, 
  IconFileText, 
  IconFolder, 
  IconClipboardList, 
  IconDatabase,
  IconSettings,
  IconUserPlus,
  IconUser,
  IconLogout,
  IconBuilding,
  IconRobot,
  IconMessage,
  IconHelp,
  IconShield
} from '@tabler/icons-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';

export function AdminSidebar(): React.ReactElement {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSignOut = useCallback(() => signOut(), [signOut]);

  // Determine the appropriate dashboard link based on user role
  const getDashboardLink = () => {
    const userRole = user?.publicMetadata?.role;
    const orgRole = user?.organizationMemberships?.[0]?.role;
    
    // If user is global admin, stay in global admin area
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
      label: "Overview",
      href: "/global-admin",
      icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Users",
      href: "/global-admin/users",
      icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Posts",
      href: "/global-admin/posts",
      icon: <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Projects",
      href: "/global-admin/projects",
      icon: <IconFolder className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Project Requests",
      href: "/global-admin/project-requests",
      icon: <IconClipboardList className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Access Requests",
      href: "/global-admin/access-requests",
      icon: <IconUserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Vectorize Documents",
      href: "/global-admin/documents",
      icon: <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Document Submissions",
      href: "/global-admin/document-submissions",
      icon: <IconClipboardList className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Stored Documents",
      href: "/global-admin/stored-documents",
      icon: <IconDatabase className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Chatbot Settings",
      href: "/global-admin/chatbot-settings",
      icon: <IconRobot className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Policy Bot",
      href: "/global-admin/policy-bot",
      icon: <IconShield className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "System Prompts",
      href: "/global-admin/system-prompts",
      icon: <IconMessage className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "FAQs",
      href: "/global-admin/faqs",
      icon: <IconHelp className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: "Settings",
      href: "/global-admin/settings",
      icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    }
  ];

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
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
              <Link href={getDashboardLink()} className="flex items-center gap-2 p-2 hover:bg-gray-100">
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
      </SidebarBody>
    </Sidebar>
  );
}
