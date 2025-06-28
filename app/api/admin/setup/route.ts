import { NextRequest, NextResponse } from 'next/server';
import { setUserAsAdmin, removeUserAsAdmin, isUserAdmin, getAllAdminUsers, setUserAsGlobalAdmin } from '@/app/lib/clerk/adminSetup';
import { auth } from '@clerk/nextjs/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';

export async function POST(req: NextRequest): Promise<Response> {
	// Only allow in development
	if (process.env.NODE_ENV === 'production') {
		return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
	}

	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { action, targetUserId } = body;

		switch (action) {
			case 'setAdmin':
				await setUserAsAdmin(targetUserId || userId);
				return NextResponse.json({ message: 'User set as admin' });
			
			case 'removeAdmin':
				await removeUserAsAdmin(targetUserId || userId);
				return NextResponse.json({ message: 'Admin role removed' });
			
			case 'setGlobalAdmin':
				await setUserAsGlobalAdmin(targetUserId || userId);
				return NextResponse.json({ message: 'User set as global admin' });
			
			case 'checkAdmin':
				const isAdmin = await isUserAdmin(targetUserId || userId);
				return NextResponse.json({ isAdmin });
			
			case 'listAdmins':
				const admins = await getAllAdminUsers();
				return NextResponse.json({ admins });
			
			default:
				return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
		}
	} catch (error) {
		logServerError('admin setup', error);
		return NextResponse.json(formatApiError(error), { status: 500 });
	}
} 