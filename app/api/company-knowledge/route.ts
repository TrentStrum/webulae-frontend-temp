import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Define schema for company knowledge request validation
const companyKnowledgeSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  service_name: z.string().optional(),
  service_description: z.string().optional(),
  pricing_info: z.string().optional(),
  use_cases: z.string().optional()
});

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

// GET - Retrieve all company knowledge
export const GET = withRateLimit(async (): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-knowledge`, {
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
    logServerError('company-knowledge GET API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

// POST - Add new company knowledge
export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = companyKnowledgeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const knowledgeData = result.data;

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeData)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to add company knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logServerError('company-knowledge POST API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

// PUT - Update company knowledge (requires knowledge ID in URL)
export const PUT = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Get knowledge ID from URL
    const url = new URL(req.url);
    const knowledgeId = url.searchParams.get('id');
    
    if (!knowledgeId) {
      return NextResponse.json(
        { error: 'Knowledge ID is required', status: 400 },
        { status: 400 }
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
    
    const updateData = result.data;

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-knowledge/${knowledgeId}`, {
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
    logServerError('company-knowledge PUT API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

// DELETE - Delete company knowledge (requires knowledge ID in URL)
export const DELETE = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Get knowledge ID from URL
    const url = new URL(req.url);
    const knowledgeId = url.searchParams.get('id');
    
    if (!knowledgeId) {
      return NextResponse.json(
        { error: 'Knowledge ID is required', status: 400 },
        { status: 400 }
      );
    }

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-knowledge/${knowledgeId}`, {
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
    logServerError('company-knowledge DELETE API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 