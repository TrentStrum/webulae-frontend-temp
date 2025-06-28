import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const MODULAR_SERVICE_URL = process.env.MODULAR_SERVICE_URL || 'http://localhost:8002';

// Define schemas for request validation
const companySystemPromptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.number().optional().default(1),
  is_active: z.boolean().optional().default(true)
});

const updateCompanySystemPromptSchema = z.object({
  name: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.number().optional(),
  is_active: z.boolean().optional()
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company System Prompts New API: Create request received');
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
    const result = companySystemPromptSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-system-prompts-new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to create company system prompt', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: '/company-system-prompts-new'
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

export const GET = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company System Prompts New API: Get all request received');
    }
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-system-prompts-new`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get company system prompts', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: '/company-system-prompts-new'
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