import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { organizationSchema } from '@/app/schemas/organizationSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Get all organizations for the current user
export const GET = withRateLimit(async () => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Get user's organizations from Clerk
    const clerk = await clerkClient();
    const organizationMemberships = await clerk.users.getOrganizationMembershipList({
      userId,
    });
    
    const organizations = organizationMemberships.data.map(membership => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      imageUrl: membership.organization.imageUrl,
      role: membership.role,
      createdAt: membership.organization.createdAt,
      updatedAt: membership.organization.updatedAt,
    }));
    
    return NextResponse.json(organizations, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60' // Cache for 1 minute for authenticated users
      }
    });
  } catch (error) {
    logServerError('Failed to fetch organizations', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Create a new organization
export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = organizationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Create the organization in Clerk
    const clerk = await clerkClient();
    const organization = await clerk.organizations.createOrganization({
      name: result.data.name,
      slug: result.data.slug,
      createdBy: userId,
    });
    
    // Add the current user as the primary admin
    await clerk.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId,
      role: 'admin',
    });
    
    // Return the created organization
    const createdOrg = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      imageUrl: organization.imageUrl,
      description: result.data.description,
      industry: result.data.industry,
      website: result.data.website,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
    
    return NextResponse.json(createdOrg, { status: 201 });
  } catch (error) {
    logServerError('Failed to create organization', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 