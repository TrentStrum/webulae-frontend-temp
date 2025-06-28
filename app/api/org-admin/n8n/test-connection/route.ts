import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { N8nClient } from '@/app/lib/n8n/client';

// Schema for connection test
const connectionTestSchema = z.object({
  n8n_base_url: z.string().url('Valid n8n URL is required'),
  n8n_api_key: z.string().min(1, 'API key is required'),
});

export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId, orgId } = await getAuth(req);
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is org admin
    const user = await fetch(`${process.env.CLERK_API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());

    const userRole = user.public_metadata?.role;
    if (userRole !== 'org_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = connectionTestSchema.parse(body);

    // Test the connection
    const n8nClient = new N8nClient(validatedData.n8n_base_url, validatedData.n8n_api_key);
    const isConnected = await n8nClient.testConnection();

    if (isConnected) {
      // Try to get workflows to verify full access
      try {
        const workflows = await n8nClient.getWorkflows();
        return NextResponse.json({
          success: true,
          message: 'Connection successful',
          workflows_count: workflows.length,
        });
      } catch (workflowError) {
        return NextResponse.json({
          success: true,
          message: 'Connection successful but workflow access failed',
          warning: 'API key may not have sufficient permissions',
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'Connection failed',
      }, { status: 400 });
    }
  } catch (error) {
    logServerError('POST /api/org-admin/n8n/test-connection', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 