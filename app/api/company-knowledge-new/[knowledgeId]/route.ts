import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const MODULAR_SERVICE_URL = process.env.MODULAR_SERVICE_URL || 'http://localhost:8002';

// Define schema for update request validation
const updateCompanyKnowledgeSchema = z.object({
  category: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  service_name: z.string().optional(),
  service_description: z.string().optional(),
  pricing_info: z.string().optional(),
  use_cases: z.string().optional()
});

export const GET = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { knowledgeId: string } }
): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company Knowledge New API: Get by ID request received', params.knowledgeId);
    }
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-knowledge-new/${params.knowledgeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get company knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: `/company-knowledge-new/${params.knowledgeId}`
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-knowledge-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const PUT = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { knowledgeId: string } }
): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company Knowledge New API: Update request received', params.knowledgeId);
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
    const result = updateCompanyKnowledgeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-knowledge-new/${params.knowledgeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to update company knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: `/company-knowledge-new/${params.knowledgeId}`
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-knowledge-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const DELETE = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { knowledgeId: string } }
): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company Knowledge New API: Delete request received', params.knowledgeId);
    }
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-knowledge-new/${params.knowledgeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to delete company knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: `/company-knowledge-new/${params.knowledgeId}`
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-knowledge-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 