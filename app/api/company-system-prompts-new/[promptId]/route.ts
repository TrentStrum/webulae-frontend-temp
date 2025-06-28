import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const MODULAR_SERVICE_URL = process.env.MODULAR_SERVICE_URL || 'http://localhost:8002';

// Define schema for update request validation
const updateCompanySystemPromptSchema = z.object({
  name: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.number().optional(),
  is_active: z.boolean().optional()
});

export const GET = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { promptId: string } }
): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company System Prompts New API: Get by ID request received', params.promptId);
    }
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-system-prompts-new/${params.promptId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get company system prompt', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: `/company-system-prompts-new/${params.promptId}`
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-system-prompts-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const PUT = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { promptId: string } }
): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company System Prompts New API: Update request received', params.promptId);
    }
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = updateCompanySystemPromptSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-system-prompts-new/${params.promptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to update company system prompt', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: `/company-system-prompts-new/${params.promptId}`
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-system-prompts-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const DELETE = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { promptId: string } }
): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company System Prompts New API: Delete request received', params.promptId);
    }
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-system-prompts-new/${params.promptId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to delete company system prompt', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: `/company-system-prompts-new/${params.promptId}`
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-system-prompts-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 