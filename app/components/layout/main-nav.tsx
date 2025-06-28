'use client';

import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  User, 
  LogOut, 
  Building2, 
  Home, 
  MessageSquare, 
  FileText, 
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { useMemo } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Image from 'next/image';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Function to get the appropriate dashboard link based on user role
const getDashboardLink = (user: any) => {
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

// Memoized navigation link component
const NavLink = memo(({ href, label, icon: Icon, onClick }: { 
	href: string; 
	label: string; 
	icon: React.ElementType;
	onClick?: () => void;
}) => (
	<Link 
		href={href} 
		className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors text-foreground"
		onClick={onClick}
		aria-label={label}
	>
		<Icon className="h-5 w-5" aria-hidden="true" />
		<span>{label}</span>
	</Link>
));

NavLink.displayName = 'NavLink';

// Memoized mobile menu component
const MobileMenu = memo(({ open, setOpen, user }: { open: boolean; setOpen: (open: boolean) => void; user: any }) => (
	<>
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
					<Menu className="w-6 h-6" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-64">
				<SheetHeader className="mb-4">
					<SheetTitle>Menu</SheetTitle>
				</SheetHeader>
				<div className="flex flex-col space-y-3 mt-8">
					<NavLink
						href={getDashboardLink(user)}
						label="Dashboard"
						icon={LayoutDashboard}
						onClick={() => setOpen(false)}
					/>
					<NavLink
						href="/chat"
						label="Chat"
						icon={MessageSquare}
						onClick={() => setOpen(false)}
					/>
					<NavLink
						href="/documents"
						label="Documents"
						icon={FileText}
						onClick={() => setOpen(false)}
					/>
				</div>
			</SheetContent>
		</Sheet>
	</>
));

MobileMenu.displayName = 'MobileMenu';

// User menu component
function UserMenu() {
	const { user } = useUser();
	const { signOut } = useClerk();
	
	const handleSignOut = useCallback(() => signOut(), [signOut]);
	
	if (!user) {
		return (
			<div className="flex gap-2">
				<Button asChild variant="outline" size="sm">
					<Link href="/sign-in">Sign In</Link>
				</Button>
				<Button asChild size="sm">
					<Link href="/sign-up">Sign Up</Link>
				</Button>
			</div>
		);
	}
	
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2 p-1">
					<Avatar className="h-8 w-8">
						<AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
						<AvatarFallback>
							{user.firstName?.[0]}{user.lastName?.[0]}
						</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium hidden md:block">
						{user.fullName || user.username}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex flex-col">
						<span>{user.fullName}</span>
						<span className="text-xs text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</span>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/account" className="flex items-center gap-2 cursor-pointer">
						<User className="h-4 w-4" />
						Personal Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/organization" className="flex items-center gap-2 cursor-pointer">
						<Building2 className="h-4 w-4" />
						Organization Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="flex items-center gap-2 cursor-pointer">
						<Settings className="h-4 w-4" />
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href={getDashboardLink(user)} className="flex items-center gap-2 cursor-pointer">
						<Home className="h-4 w-4" />
						Dashboard
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem 
					onClick={handleSignOut}
					className="text-red-600 dark:text-red-400 cursor-pointer"
				>
					<LogOut className="h-4 w-4 mr-2" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function MainNav(): React.ReactElement {
	const [open, setOpen] = useState(false);
	const { user } = useUser();

	// Memoize desktop navigation links
	const desktopNavLinks = useMemo(() => (
		<div className="hidden md:flex gap-6 items-center">
			<Link href="/" className="flex items-center gap-2 font-semibold text-lg">
				<div className="bg-primary/10 p-1 rounded">
					<LayoutDashboard className="h-5 w-5 text-primary" />
				</div>
				<span>Webulae</span>
			</Link>
			<NavLink
				href={getDashboardLink(user)}
				label="Dashboard"
				icon={Home}
			/>
			<NavLink
				href="/chat"
				label="Chat"
				icon={MessageSquare}
			/>
			<NavLink
				href="/documents"
				label="Documents"
				icon={FileText}
			/>
		</div>
	), [user]);

	return (
		<nav className="flex items-center justify-between w-full" role="navigation" aria-label="Main">
			{/* Mobile Logo */}
			<div className="md:hidden flex items-center gap-2 font-semibold text-lg">
				<div className="bg-primary/10 p-1 rounded">
					<LayoutDashboard className="h-5 w-5 text-primary" />
				</div>
				<span>Webulae</span>
			</div>
			
			{/* Desktop Navigation Links */}
			{desktopNavLinks}

			{/* Mobile Menu Trigger */}
			<div className="md:hidden">
				<MobileMenu open={open} setOpen={setOpen} user={user} />
			</div>

			{/* User Info and Theme Toggle */}
			<div className="flex items-center gap-2">
				<UserMenu />
			</div>
		</nav>
	);
}