"use client"

import * as React from "react"
import {
  Users,
  FileText,
  FolderOpen,
  ClipboardList,
  UserPlus,
  Database,
  Settings,
  Shield,
  MessageSquare,
  HelpCircle,
  Activity,
  Building,
  LogOut,
  ChevronRight,
  ChevronsUpDown,
  Bell,
  CreditCard,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'

// Admin navigation items
const adminNavItems = [
  {
    title: "Overview",
    url: "/global-admin",
    icon: Activity,
    isActive: true,
  },
  {
    title: "User Management",
    url: "/global-admin/users",
    icon: Users,
    items: [
      {
        title: "All Users",
        url: "/global-admin/users",
      },
      {
        title: "Access Requests",
        url: "/global-admin/access-requests",
      },
    ],
  },
  {
    title: "Content Management",
    url: "/global-admin/posts",
    icon: FileText,
    items: [
      {
        title: "Posts",
        url: "/global-admin/posts",
      },
      {
        title: "Projects",
        url: "/global-admin/projects",
      },
      {
        title: "Project Requests",
        url: "/global-admin/project-requests",
      },
    ],
  },
  {
    title: "Document Management",
    url: "/global-admin/documents",
    icon: Database,
    items: [
      {
        title: "Vectorize Documents",
        url: "/global-admin/documents",
      },
      {
        title: "Document Submissions",
        url: "/global-admin/document-submissions",
      },
      {
        title: "Stored Documents",
        url: "/global-admin/stored-documents",
      },
    ],
  },
  {
    title: "AI & Automation",
    url: "/global-admin/chatbot-settings",
    icon: MessageSquare,
    items: [
      {
        title: "Chatbot Settings",
        url: "/global-admin/chatbot-settings",
      },
      {
        title: "Policy Bot",
        url: "/global-admin/policy-bot",
      },
      {
        title: "System Prompts",
        url: "/global-admin/system-prompts",
      },
    ],
  },
  {
    title: "Support",
    url: "/global-admin/faqs",
    icon: HelpCircle,
    items: [
      {
        title: "FAQs",
        url: "/global-admin/faqs",
      },
    ],
  },
  {
    title: "Settings",
    url: "/global-admin/settings",
    icon: Settings,
    items: [
      {
        title: "System Settings",
        url: "/global-admin/settings",
      },
    ],
  },
]

function AdminNavMain() {
  return (
    <SidebarMenu>
      {adminNavItems.map((item) => (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={item.isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </Link>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            {item.items && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  )
}

function AdminNavUser() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { isMobile } = useSidebar()

  const handleSignOut = () => signOut()

  // Determine the appropriate dashboard link based on user role
  const getDashboardLink = () => {
    const userRole = user?.publicMetadata?.role
    const orgRole = user?.organizationMemberships?.[0]?.role
    
    // If user is global admin, stay in global admin area
    if (userRole === 'global_admin' || userRole === 'admin') {
      return '/global-admin'
    }
    
    // If user is org admin, go to org admin dashboard
    if (orgRole === 'org:admin') {
      return '/org-admin'
    }
    
    // Default to regular dashboard
    return '/dashboard'
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="rounded-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.fullName || "User"}</span>
                <span className="truncate text-xs">{user?.emailAddresses?.[0]?.emailAddress}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                  <AvatarFallback className="rounded-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.fullName || "User"}</span>
                  <span className="truncate text-xs">{user?.emailAddresses?.[0]?.emailAddress}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <User className="mr-2 h-4 w-4" />
                  Personal Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/organization">
                  <Building className="mr-2 h-4 w-4" />
                  Organization Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={getDashboardLink()}>
                <Activity className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AdminSidebarNew({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-red-700 text-white">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Shield className="h-6 w-6" />
          <span className="font-semibold">Global Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 