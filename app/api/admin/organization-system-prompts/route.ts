import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { CreateSystemPromptRequest, UpdateSystemPromptRequest } from '@/app/types/systemPrompt.types';

// Define schema for system prompt validation
const createSystemPromptSchema = z.object({
  prompt_name: z.string().min(1, "Prompt name is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.number().int().min(1).max(10).optional().default(1),
  is_active: z.boolean().optional().default(true)
});

const updateSystemPromptSchema = z.object({
  prompt_name: z.string().min(1, "Prompt name is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
  priority: z.number().int().min(1).max(10).optional(),
  is_active: z.boolean().optional()
});

export const GET = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is global admin or org admin
    const userRole = sessionClaims?.metadata?.role;
    const isGlobalAdmin = userRole === 'global_admin';
    const isOrgAdmin = userRole === 'org:admin';
    
    if (!isGlobalAdmin && !isOrgAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin or organization admin access required', status: 403 }, { status: 403 });
    }

    // Get organization ID - for org admin from session, for global admin from query param
    let organizationId: string;
    if (isOrgAdmin) {
      organizationId = sessionClaims?.metadata?.organization_id;
      if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID not found', status: 400 }, { status: 400 });
      }
    } else {
      // Global admin - get organization ID from query parameter
      const url = new URL(req.url);
      organizationId = url.searchParams.get('organizationId') || '';
      if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID parameter required for global admin', status: 400 }, { status: 400 });
      }
    }

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/organization-system-prompts?organization_id=${organizationId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`);
    }

    // Read and log the raw response text
    const text = await response.text();
    console.log('Raw response from Python service:', text);
    const data = text ? JSON.parse(text) : [];
    console.log('Parsed data:', data);
    
    // Transform the response to match frontend expectations
    const transformedData = data.map((prompt: any) => ({
      id: prompt.id,
      name: prompt.prompt_name,
      content: prompt.content,
      category: prompt.category,
      priority: prompt.priority,
      is_active: prompt.is_active,
      created_at: prompt.created_at,
      updated_at: prompt.updated_at,
      organization_id: prompt.organization_id
    }));
    
    console.log('Transformed data being returned:', transformedData);
    return NextResponse.json(transformedData);
  } catch (error) {
    logServerError('organization system prompts GET', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is global admin or org admin
    const userRole = sessionClaims?.metadata?.role;
    const isGlobalAdmin = userRole === 'global_admin';
    const isOrgAdmin = userRole === 'org:admin';
    
    if (!isGlobalAdmin && !isOrgAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin or organization admin access required', status: 403 }, { status: 403 });
    }

    // Parse and validate request body first
    const body = await req.json();
    const result = createSystemPromptSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }

    // Get organization ID - for org admin from session, for global admin from request body
    let organizationId: string;
    if (isOrgAdmin) {
      organizationId = sessionClaims?.metadata?.organization_id;
      if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID not found', status: 400 }, { status: 400 });
      }
    } else {
      // Global admin - get organization ID from request body
      organizationId = body.organization_id;
      if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID required in request body for global admin', status: 400 }, { status: 400 });
      }
    }

    // Transform the data to match Python service expectations
    const pythonServiceData = {
      organization_id: organizationId,
      name: result.data.prompt_name,
      content: result.data.content,
      category: result.data.category,
      priority: result.data.priority,
      is_active: result.data.is_active
    };

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/organization-system-prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pythonServiceData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python service error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('organization system prompts POST', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 