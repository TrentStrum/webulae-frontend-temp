import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { organizationMemberSchema } from '@/app/schemas/organizationSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Get all members of an organization
export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    const organizationId = req.nextUrl.pathname.split('/').pop() || '';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Check if user is a member of this organization
    const clerk = await clerkClient();
    const membership = await clerk.organizations.getOrganizationMembershipList({
        userId: [userId],
        organizationId,
    });
    
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 });
    }
    
    // Get organization members from Clerk
    const members = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    });
    
    const membersData = members.data.map(member => ({
      id: member.id,
      organizationId: member.organization.id,
      userId: member.publicUserData?.userId,
      role: member.role,
      isActive: true,
      isPrimary: member.role === 'admin' && member.createdAt === member.organization.createdAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.publicUserData ? {
        id: member.publicUserData.userId,
        name: `${member.publicUserData.firstName} ${member.publicUserData.lastName}`.trim(),
        email: member.publicUserData.identifier,
        role: 'user',
      } : undefined,
    }));
    
    return NextResponse.json(membersData, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    logServerError('Failed to fetch organization members', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Add a member to an organization
export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    const organizationId = req.nextUrl.pathname.split('/').pop() || '';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Check if user is an admin of this organization
    const clerk = await clerkClient();
      const membership = await clerk.organizations.getOrganizationMembershipList({
      userId: [userId],
      organizationId,
    });
    
    if (!membership || membership.data.some(member => member.role === 'admin')) {
      return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = organizationMemberSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Invite member to organization
    const invite = await clerk.organizations.createOrganizationInvitation({
      organizationId,
      emailAddress: result.data.email,
      role: result.data.role,
      redirectUrl: `${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}/organization/${organizationId}`,
    });
    
    const memberData = {
      id: invite.id,
      organizationId: invite.organizationId,
      userId: null, // Will be set when user accepts invitation
      role: invite.role,
      isActive: false,
      isPrimary: false,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
      email: result.data.email,
    };
    
    return NextResponse.json(memberData, { status: 201 });
  } catch (error) {
    logServerError('Failed to add organization member', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 