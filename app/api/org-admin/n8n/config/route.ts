import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { 
  getN8nOrganizationConfig, 
  saveN8nOrganizationConfig 
} from '@/app/dataAccess/n8n/n8nDataAccess';
import { N8nOrganizationConfig } from '@/app/types/n8n.types';

// Schema for n8n configuration
const n8nConfigSchema = z.object({
  n8n_base_url: z.string().url('Valid n8n URL is required'),
  n8n_api_key: z.string().min(1, 'API key is required'),
  webhook_secret: z.string().optional(),
  max_executions_per_minute: z.number().min(1).max(1000).default(60),
});

export const GET = withRateLimit(async (req: NextRequest) => {
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

    const config = await getN8nOrganizationConfig(orgId);
    
    return NextResponse.json(config);
  } catch (error) {
    logServerError('GET /api/org-admin/n8n/config', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
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
    const validatedData = n8nConfigSchema.parse(body);

    const config: Omit<N8nOrganizationConfig, 'created_at' | 'updated_at'> = {
      organization_id: orgId,
      n8n_base_url: validatedData.n8n_base_url,
      n8n_api_key: validatedData.n8n_api_key,
      webhook_secret: validatedData.webhook_secret,
      allowed_workflows: [], // Will be populated separately
      max_executions_per_minute: validatedData.max_executions_per_minute,
    };

    const savedConfig = await saveN8nOrganizationConfig(config);
    
    return NextResponse.json(savedConfig);
  } catch (error) {
    logServerError('POST /api/org-admin/n8n/config', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 