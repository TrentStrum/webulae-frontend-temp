'use client';

import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState, memo, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Menu, User, LogOut, Building2, Home, MessageSquare, FileText, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import Image from 'next/image';

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
		className="font-medium hover:underline flex items-center gap-2 p-2 hover:bg-muted rounded-md"
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
		<Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(!open)}>
			<Menu className="w-6 h-6" />
		</Button>
		{open && (
			<div className="fixed inset-0 z-50 bg-black bg-opacity-50">
				<div className="fixed left-0 top-0 h-full w-64 bg-white p-4">
					<div className="flex flex-col space-y-4 mt-8">
						<NavLink
							href={getDashboardLink(user)}
							label="Dashboard"
							icon={Home}
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
				</div>
			</div>
		)}
	</>
));

MobileMenu.displayName = 'MobileMenu';

// Separate component for the actual user menu functionality
function UserMenuContent() {
	const { user } = useUser();
	const { signOut } = useClerk();
	const [isOpen, setIsOpen] = useState(false);
	
	const handleSignOut = useCallback(() => signOut(), [signOut]);
	
	return (
		<div className="relative">
			<Button variant="ghost" className="flex items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
				<span className="text-sm text-muted-foreground truncate max-w-[120px]">
					{user?.fullName}
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
					<User className="w-5 h-5" />
				)}
			</Button>
			{isOpen && (
				<div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
					<Link href="/account" className="flex items-center gap-2 p-2 hover:bg-gray-100">
						<User className="w-4 h-4" />
						Personal Profile
					</Link>
					<Link href="/organization" className="flex items-center gap-2 p-2 hover:bg-gray-100">
						<Building2 className="w-4 h-4" />
						Organization Settings
					</Link>
					<Link href="/settings" className="flex items-center gap-2 p-2 hover:bg-gray-100">
						<Settings className="w-4 h-4" />
						Settings
					</Link>
					<hr className="my-1" />
					<button
						onClick={handleSignOut}
						className="flex items-center gap-2 p-2 hover:bg-gray-100 text-red-600 w-full text-left"
					>
						<LogOut className="w-4 h-4" />
						Sign out
					</button>
				</div>
			)}
		</div>
	);
}

// Memoized user menu component
const UserMenu = memo(() => {
	const { user } = useUser();
	
	// Always render the component, but conditionally show content
	if (!user) {
		return <div className="w-8 h-8" />; // Placeholder to maintain layout
	}
	
	return <UserMenuContent />;
});

UserMenu.displayName = 'UserMenu';

export function MainNav(): React.ReactElement {
	const [open, setOpen] = useState(false);
	const { user } = useUser();

	// Memoize desktop navigation links
	const desktopNavLinks = useMemo(() => (
		<div className="hidden md:flex gap-6 items-center">
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
		<nav className="flex items-center justify-between w-full max-w-screen-xl mx-auto px-4" role="navigation" aria-label="Main">
			{/* Desktop Navigation Links */}
			<div className="flex items-center gap-4">
				{desktopNavLinks}
			</div>

			{/* Mobile Menu Trigger */}
			<div className="md:hidden">
				<MobileMenu open={open} setOpen={setOpen} user={user} />
			</div>

			{/* User Info and Theme Toggle */}
			<div className="flex items-center gap-2">
				<ThemeToggle />
				<UserMenu />
			</div>
		</nav>
	);
}