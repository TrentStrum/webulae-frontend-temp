import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { organizationSchema } from '@/app/schemas/organizationSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Get a specific organization
export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    const organizationId = req.nextUrl.pathname.split('/').pop() || '';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Get organization from Clerk
    const clerk = await clerkClient();
    const organization = await clerk.organizations.getOrganization({
      organizationId,
    });
    
    // Check if user is a member of this organization
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    });
    
    const userMembership = memberships.data.find(member => member.publicUserData?.userId === userId);
    if (!userMembership) {
      return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 });
    }
    
    const orgData = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      imageUrl: organization.imageUrl,
      description: organization.publicMetadata?.description,
      industry: organization.publicMetadata?.industry,
      website: organization.publicMetadata?.website,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
    
    return NextResponse.json(orgData, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    logServerError('Failed to fetch organization', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Update an organization
export const PUT = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    const organizationId = req.nextUrl.pathname.split('/').pop() || '';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    } 
    
    // Check if user is an admin of this organization
    const clerk = await clerkClient();
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    });
    
    const userMembership = memberships.data.find(member => member.publicUserData?.userId === userId);
    if (!userMembership || userMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = organizationSchema.partial().safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Update organization in Clerk
    const updateData: Record<string, string> = {};
    if (result.data.name) updateData.name = result.data.name;
    if (result.data.slug) updateData.slug = result.data.slug;
    
    // Store additional metadata
    const publicMetadata: Record<string, string> = {};
    if (result.data.description) publicMetadata.description = result.data.description;
    if (result.data.industry) publicMetadata.industry = result.data.industry;
    if (result.data.website) publicMetadata.website = result.data.website;
    
    if (Object.keys(publicMetadata).length > 0) {
      updateData.publicMetadata = JSON.stringify(publicMetadata);
    }
    
    const organization = await clerk.organizations.updateOrganization(
      organizationId,
      updateData
    );
    
    const updatedOrg = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      imageUrl: organization.imageUrl,
      description: organization.publicMetadata?.description,
      industry: organization.publicMetadata?.industry,
      website: organization.publicMetadata?.website,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
    
    return NextResponse.json(updatedOrg, { status: 200 });
  } catch (error) {
    logServerError('Failed to update organization', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

// Delete an organization
export const DELETE = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    const organizationId = req.nextUrl.pathname.split('/').pop() || '';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Check if user is an admin of this organization
    const clerk = await clerkClient();
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    });
    
    const userMembership = memberships.data.find(member => member.publicUserData?.userId === userId);
    if (!userMembership || userMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 });
    }
    
    // Delete organization from Clerk
    await clerk.organizations.deleteOrganization(organizationId);
    
    return NextResponse.json({ message: 'Organization deleted successfully' }, { status: 200 });
  } catch (error) {
    logServerError('Failed to delete organization', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 