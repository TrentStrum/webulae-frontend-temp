import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Get a specific user
export const GET = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(currentUserId);
    const isGlobalAdmin = currentUser.publicMetadata?.role === 'global_admin';
    
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 });
    }
    
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required', status: 400 }, { status: 400 });
    }
    
    const user = await clerk.users.getUser(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found', status: 404 }, { status: 404 });
    }
    
    const transformedUser = {
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
    };
    
    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error(`Error fetching user ${params.userId}:`, error);
    logServerError(`Failed to fetch user ${params.userId}`, error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Update a user
export const PUT = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId: currentUserId } = await auth();
    const targetUserId = req.nextUrl.pathname.split('/').pop() || '';
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Check if the current user is a global admin
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(currentUserId);
    const isGlobalAdmin = currentUser.publicMetadata?.role === 'global_admin';
    
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Update user in Clerk
    const updateData: Record<string, string> = {};
    
    if (body.name) {
      const nameParts = body.name.split(' ');
      updateData.firstName = nameParts[0] || '';
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    if (body.email) {
      updateData.emailAddress = body.email;
    }
    
    // Update metadata
    const publicMetadata: Record<string, string> = {};
    if (body.organizationName !== undefined) {
      publicMetadata.organizationName = body.organizationName;
    }
    if (body.companyName !== undefined) {
      publicMetadata.companyName = body.companyName;
    }
    if (body.role !== undefined) {
      publicMetadata.role = body.role;
    }
    
    if (Object.keys(publicMetadata).length > 0) {
      updateData.publicMetadata = JSON.stringify(publicMetadata);
    }
    
    const updatedUser = await clerk.users.updateUser(targetUserId, updateData);
    
    const transformedUser = {
      id: updatedUser.id,
      name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.username || '',
      email: updatedUser.emailAddresses[0]?.emailAddress || '',
      username: updatedUser.username || '',
      role: updatedUser.publicMetadata?.role || 'user',
      organizationName: updatedUser.publicMetadata?.organizationName || '',
      organizationId: updatedUser.publicMetadata?.organizationId || '',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
    
    return NextResponse.json(transformedUser, { status: 200 });
  } catch (error) {
    logServerError('Failed to update user', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Delete a user
export const DELETE = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId: currentUserId } = await auth();
    const targetUserId = req.nextUrl.pathname.split('/').pop() || '';
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Check if the current user is a global admin
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(currentUserId);
    const isGlobalAdmin = currentUser.publicMetadata?.role === 'global_admin';
    
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }
    
    // Prevent self-deletion
    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: 'Cannot delete your own account', status: 400 }, { status: 400 });
    }
    
    // Delete user from Clerk
    await clerk.users.deleteUser(targetUserId);
    
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    logServerError('Failed to delete user', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 