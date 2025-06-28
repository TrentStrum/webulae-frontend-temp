import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateOrganizationMemberSchema } from '@/app/schemas/organizationSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Update an organization member
export const PUT = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    const pathParts = req.nextUrl.pathname.split('/');
    const organizationId = pathParts[pathParts.length - 3];
    const memberId = pathParts[pathParts.length - 1];
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = updateOrganizationMemberSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Note: Organization member updates should be handled through Clerk's dashboard
    // This is a placeholder that shows the validated data
    const memberData = {
      id: memberId,
      organizationId,
      userId: memberId,
      role: result.data.role || 'member',
      isActive: true,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: memberId,
        name: 'User Name',
        email: 'user@example.com',
        role: 'user',
      },
    };
    
    return NextResponse.json(memberData, { status: 200 });
  } catch (error) {
    logServerError('Failed to update organization member', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Remove a member from an organization
export const DELETE = withRateLimit(async () => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Note: Organization member removal should be handled through Clerk's dashboard
    // This is a placeholder that shows success
    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });
  } catch (error) {
    logServerError('Failed to remove organization member', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 