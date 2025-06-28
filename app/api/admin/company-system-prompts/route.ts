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

    // Check if user is global admin
    const isGlobalAdmin = sessionClaims?.metadata?.role === 'global_admin';
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-system-prompts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response to match frontend expectations
    const transformedData = {
      prompts: data.map((prompt: any) => ({
        id: prompt.id,
        prompt_name: prompt.name,
        content: prompt.content,
        category: prompt.category,
        priority: prompt.priority,
        is_active: prompt.is_active,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at
      }))
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    logServerError('company system prompts GET', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is global admin
    const isGlobalAdmin = sessionClaims?.metadata?.role === 'global_admin';
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const result = createSystemPromptSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }

    // Transform the data to match Python service expectations
    const pythonServiceData = {
      name: result.data.prompt_name,
      content: result.data.content,
      category: result.data.category,
      priority: result.data.priority,
      is_active: result.data.is_active
    };

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-system-prompts`, {
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
    logServerError('company system prompts POST', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const PUT = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is global admin
    const isGlobalAdmin = sessionClaims?.metadata?.role === 'global_admin';
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }

    // Get prompt ID from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const promptId = pathParts[pathParts.length - 1];

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required', status: 400 }, { status: 400 });
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

    // Transform the data to match Python service expectations
    const pythonServiceData: any = {};
    if (result.data.prompt_name !== undefined) pythonServiceData.name = result.data.prompt_name;
    if (result.data.content !== undefined) pythonServiceData.content = result.data.content;
    if (result.data.category !== undefined) pythonServiceData.category = result.data.category;
    if (result.data.priority !== undefined) pythonServiceData.priority = result.data.priority;
    if (result.data.is_active !== undefined) pythonServiceData.is_active = result.data.is_active;

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-system-prompts/${promptId}`, {
      method: 'PUT',
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
    logServerError('company system prompts PUT', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const DELETE = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is global admin
    const isGlobalAdmin = sessionClaims?.metadata?.role === 'global_admin';
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }

    // Get prompt ID from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const promptId = pathParts[pathParts.length - 1];

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required', status: 400 }, { status: 400 });
    }

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-system-prompts/${promptId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python service error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('company system prompts DELETE', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 