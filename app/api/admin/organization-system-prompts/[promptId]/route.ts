import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { UpdateSystemPromptRequest } from '@/app/types/systemPrompt.types';

// Define schema for system prompt validation
const updateSystemPromptSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required").optional(),
  priority: z.number().int().min(1).max(10).optional(),
  is_active: z.boolean().optional()
});

export const GET = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { promptId: string } }
): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is org admin
    const isOrgAdmin = sessionClaims?.metadata?.role === 'org:admin';
    if (!isOrgAdmin) {
      return NextResponse.json({ error: 'Forbidden - Organization admin access required', status: 403 }, { status: 403 });
    }

    const organizationId = sessionClaims?.metadata?.organization_id;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID not found', status: 400 }, { status: 400 });
    }

    const { promptId } = params;
    if (!promptId) {
      return NextResponse.json({ error: 'System prompt ID is required', status: 400 }, { status: 400 });
    }

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/organization-system-prompts/${promptId}?organization_id=${organizationId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'System prompt not found', status: 404 }, { status: 404 });
      }
      throw new Error(`Python service error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('organization system prompt GET', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const PUT = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { promptId: string } }
): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is org admin
    const isOrgAdmin = sessionClaims?.metadata?.role === 'org:admin';
    if (!isOrgAdmin) {
      return NextResponse.json({ error: 'Forbidden - Organization admin access required', status: 403 }, { status: 403 });
    }

    const organizationId = sessionClaims?.metadata?.organization_id;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID not found', status: 400 }, { status: 400 });
    }

    const { promptId } = params;
    if (!promptId) {
      return NextResponse.json({ error: 'System prompt ID is required', status: 400 }, { status: 400 });
    }

    // Parse and validate request body
    const body = await req.json();
    const result = updateSystemPromptSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/organization-system-prompts/${promptId}?organization_id=${organizationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'System prompt not found', status: 404 }, { status: 404 });
      }
      const errorText = await response.text();
      throw new Error(`Python service error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('organization system prompt PUT', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const DELETE = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { promptId: string } }
): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is org admin
    const isOrgAdmin = sessionClaims?.metadata?.role === 'org:admin';
    if (!isOrgAdmin) {
      return NextResponse.json({ error: 'Forbidden - Organization admin access required', status: 403 }, { status: 403 });
    }

    const organizationId = sessionClaims?.metadata?.organization_id;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID not found', status: 400 }, { status: 400 });
    }

    const { promptId } = params;
    if (!promptId) {
      return NextResponse.json({ error: 'System prompt ID is required', status: 400 }, { status: 400 });
    }

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/organization-system-prompts/${promptId}?organization_id=${organizationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'System prompt not found', status: 404 }, { status: 404 });
      }
      const errorText = await response.text();
      throw new Error(`Python service error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('organization system prompt DELETE', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 