import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Define schema for updating company knowledge (all fields optional)
const updateCompanyKnowledgeSchema = z.object({
  category: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  service_name: z.string().optional(),
  service_description: z.string().optional(),
  pricing_info: z.string().optional(),
  use_cases: z.string().optional()
});

// GET - Retrieve a specific company knowledge entry
export const GET = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const { id } = params;

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-knowledge/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get company knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('company-knowledge GET by ID API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

// PUT - Update a specific company knowledge entry
export const PUT = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const { id } = params;

    // Parse and validate request body
    const body = await req.json();
    const result = updateCompanyKnowledgeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const updateData = result.data;

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to update company knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('company-knowledge PUT by ID API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

// DELETE - Delete a specific company knowledge entry
export const DELETE = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const { id } = params;

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-knowledge/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to delete company knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('company-knowledge DELETE by ID API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 