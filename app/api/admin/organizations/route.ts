import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { logServerError, formatApiError } from '@/app/lib/errorHandler';

export const GET = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId } = await getAuth(req);
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has global admin role
    const userRole = await getUserRole(userId);
    if (userRole !== 'global-admin') {
      return Response.json({ error: 'Forbidden: Global admin access required' }, { status: 403 });
    }

    // Use Clerk's API to fetch organizations
    const clerkApiKey = process.env.CLERK_SECRET_KEY;
    if (!clerkApiKey) {
      throw new Error('CLERK_SECRET_KEY not configured');
    }

    const response = await fetch('https://api.clerk.com/v1/organizations', {
      headers: {
        'Authorization': `Bearer ${clerkApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Clerk API request failed with status ${response.status}`);
    }

    const organizationsResponse = await response.json();
    const orgsArray = organizationsResponse.data || [];

    const transformedOrgs = orgsArray
      .filter((org: any) => org.slug !== 'joviancloudworks') // Exclude JovianCloudWorks (company-wide data)
      .map((org: any) => ({
        id: org.id,
        name: org.name,
        description: org.description || '',
        createdAt: org.created_at,
        updatedAt: org.updated_at,
      }));

    return Response.json(transformedOrgs);
  } catch (error) {
    logServerError('Error fetching organizations', error);
    return Response.json(
      { error: formatApiError(error) },
      { status: 500 }
    );
  }
});

async function getUserRole(userId: string): Promise<string> {
  try {
    // This should be implemented based on your role management system
    // For now, returning a default role - you'll need to implement this
    return 'global-admin';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
} 