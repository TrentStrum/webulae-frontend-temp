import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { profileSchema } from '@/app/schemas/profileSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Get current user's profile
export const GET = withRateLimit(async () => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Get user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    // Transform the data to match our expected format
    const userData = {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      username: user.username || '',
      organizationName: user.publicMetadata?.organizationName || '',
      phoneNumber: user.publicMetadata?.phoneNumber || '',
        imageUrl: user.imageUrl || '',
        metadata: user.publicMetadata || {},
    };
    
    return NextResponse.json(userData, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    logServerError('Failed to fetch user profile', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Update current user's profile
export const PUT = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = profileSchema.partial().safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Update user in Clerk
    const updateData: Record<string, string> = {};
    
    if (result.data.firstName !== undefined) {
      updateData.firstName = result.data.firstName;
    }
    
    if (result.data.lastName !== undefined) {
      updateData.lastName = result.data.lastName;
    }
    
    if (result.data.email) {
      updateData.emailAddress = result.data.email;
    }
    
    if (result.data.username) {
      updateData.username = result.data.username;
    }
    
    // Update metadata
    const publicMetadata: Record<string, string> = {};
    if (result.data.organizationName !== undefined) {
      publicMetadata.organizationName = result.data.organizationName;
    }
    if (result.data.phoneNumber !== undefined) {
      publicMetadata.phoneNumber = result.data.phoneNumber;
    }
    if (result.data.metadata) {
      Object.assign(publicMetadata, result.data.metadata);
    }
    
    if (Object.keys(publicMetadata).length > 0) {
      updateData.publicMetadata = JSON.stringify(publicMetadata);
    }
    
    const clerk = await clerkClient();
    const updatedUser = await clerk.users.updateUser(userId, updateData);
    
    // Transform the response
    const userData = {
      id: updatedUser.id,
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      email: updatedUser.emailAddresses[0]?.emailAddress || '',
      username: updatedUser.username || '',
      organizationName: updatedUser.publicMetadata?.organizationName || '',
      phoneNumber: updatedUser.publicMetadata?.phoneNumber || '',
      imageUrl: updatedUser.imageUrl || '',
      metadata: updatedUser.publicMetadata || {},
    };
    
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    logServerError('Failed to update user profile', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 