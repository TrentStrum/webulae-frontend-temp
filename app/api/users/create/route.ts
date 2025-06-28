import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { adminUserCreateSchema } from '@/app/schemas/adminUserSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

export const POST = withRateLimit(async (req: NextRequest) => {
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
    
    // Parse and validate request body
    const body = await req.json();
    console.log('Received request body:', body);
    
    const result = adminUserCreateSchema.safeParse(body);
    
    if (!result.success) {
      console.log('Validation failed:', result.error.format());
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const { name, email, username, organizationName, role } = result.data;
    console.log('Validated data:', { name, email, username, organizationName, role });
    
    // Validate username format and check if it already exists
    console.log('Checking username:', username);
    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required', status: 400 },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    try {
      const existingUsers = await clerk.users.getUserList({
        username: [username],
      });
      
      if (existingUsers.data.length > 0) {
        return NextResponse.json(
          { error: 'Username already exists', status: 400 },
          { status: 400 }
        );
      }
    } catch (error) {
      console.log('Username check error (might not exist):', error);
    }
    
    // Check if email already exists
    try {
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [email],
      });
      
      if (existingUsers.data.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists', status: 400 },
          { status: 400 }
        );
      }
    } catch (error) {
      console.log('Email check error (might not exist):', error);
    }
    
    // Create or find organization
    let organization;
    
    try {
      // Try to find existing organization by name
      const organizations = await clerk.organizations.getOrganizationList({
        query: organizationName,
      });
      
      organization = organizations.data.find(org => 
        org.name.toLowerCase() === organizationName.toLowerCase()
      );
      
      if (!organization) {
        // Create new organization
        organization = await clerk.organizations.createOrganization({
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          createdBy: userId,
        });
        console.log('Created new organization:', organization.id);
      } else {
        console.log('Found existing organization:', organization.id);
      }
    } catch (error) {
      logServerError('Failed to create/find organization', error);
      return NextResponse.json(
        { error: 'Failed to create organization', status: 500 },
        { status: 500 }
      );
    }
    
    // Create user in Clerk with detailed logging
    const clerkUserData = {
      emailAddress: [email],
      username: username,
      firstName: name.split(' ')[0] || '',
      lastName: name.split(' ').slice(1).join(' ') || '',
      publicMetadata: {
        organizationName: organizationName,
        role: role || 'user',
        organizationId: organization.id,
      },
    };
    
    console.log('Creating user with data:', clerkUserData);
    console.log('Username type:', typeof username, 'Value:', JSON.stringify(username));
    
    const clerkUser = await clerk.users.createUser(clerkUserData);
    
    console.log('User created successfully:', clerkUser.id);
    
    // Add user to the organization
    await clerk.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: clerkUser.id,
      role: role === 'org_admin' ? 'admin' : 'basic_member',
    });
    
    console.log('User added to organization');
    
    // Return the created user data
    const userData = {
      id: clerkUser.id,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress || email,
      username: clerkUser.username || username,
      organizationName: clerkUser.publicMetadata?.organizationName || organizationName,
      organizationId: organization.id,
      role: clerkUser.publicMetadata?.role || role || 'user',
      createdAt: clerkUser.createdAt,
      updatedAt: clerkUser.updatedAt,
    };
    
    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    logServerError('Failed to create user', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 