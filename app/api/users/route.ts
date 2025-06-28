import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Get all users (admin only)
export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Check if the current user is a global admin
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const isGlobalAdmin = currentUser.publicMetadata?.role === 'global_admin';
    
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }
    
    // Get all users from Clerk
    const users = await clerk.users.getUserList({
      limit: 100, // Adjust as needed
    });
    
    // Transform the data to match our User type
    const transformedUsers = users.data.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      username: user.username || '',
      role: user.publicMetadata?.role || 'user',
      organizationName: user.publicMetadata?.organizationName || '',
      organizationId: user.publicMetadata?.organizationId || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSignInAt: user.lastSignInAt,
    }));
    
    return NextResponse.json(transformedUsers, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60' // Cache for 1 minute for authenticated users
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    logServerError('Failed to fetch users', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 