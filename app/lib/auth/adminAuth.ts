import { clerkClient, auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export interface AdminUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
}

export async function requireAdmin(): Promise<AdminUser> {
	// In development mode with MSW, bypass admin check for easier testing
	if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BACKEND === 'msw') {
		console.log('Development mode: Bypassing admin authentication for MSW');
		return {
			id: 'dev-admin',
			email: 'dev-admin@example.com',
			firstName: 'Development',
			lastName: 'Admin',
		};
	}

	const { userId } = await auth();

	if (!userId) {
		throw new Error('Unauthorized: No user ID found');
	}

	try {
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const userRole = user.publicMetadata?.role;
		const isAdmin = userRole === 'global_admin' || userRole === 'admin' || user.publicMetadata?.isAdmin === true;

		if (!isAdmin) {
			throw new Error('Forbidden: Admin access required');
		}

		return {
			id: user.id,
			email: user.emailAddresses[0]?.emailAddress || '',
			firstName: user.firstName || undefined,
			lastName: user.lastName || undefined,
		};
	} catch (error) {
		console.error('Admin auth error:', error);
		throw new Error('Forbidden: Admin access required');
	}
}

export async function checkAdminPermissions(userId: string): Promise<boolean> {
	// In development mode with MSW, always return true for easier testing
	if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BACKEND === 'msw') {
		return true;
	}

	try {
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const userRole = user.publicMetadata?.role;
		return userRole === 'global_admin' || userRole === 'admin' || user.publicMetadata?.isAdmin === true;
	} catch (error) {
		console.error('Error checking admin permissions:', error);
		return false;
	}
}

export function handleAuthError(error: Error): NextResponse {
	const message = error.message || 'Authentication failed';
	const status = message.includes('Unauthorized') ? 401 : 403;

	return NextResponse.json(
		{
			error: message,
		},
		{ status },
	);
}
