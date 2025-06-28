import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Define schema for organization knowledge request validation
const organizationKnowledgeSchema = z.object({
  organization_id: z.string().min(1, "Organization ID is required"),
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  service_name: z.string().optional(),
  service_description: z.string().optional(),
  pricing_info: z.string().optional(),
  use_cases: z.string().optional()
});

// Define schema for updating organization knowledge (all fields optional)
const updateOrganizationKnowledgeSchema = z.object({
  category: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  service_name: z.string().optional(),
  service_description: z.string().optional(),
  pricing_info: z.string().optional(),
  use_cases: z.string().optional()
});

// GET - Retrieve all knowledge for a specific organization
export const GET = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { organizationId: string } }
): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const { organizationId } = params;

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/organization-knowledge/${organizationId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get organization knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('organization-knowledge GET API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

// POST - Add new organization knowledge
export const POST = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { organizationId: string } }
): Promise<Response> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const { organizationId } = params;

    // Parse and validate request body
    const body = await req.json();
    const result = organizationKnowledgeSchema.safeParse({
      ...body,
      organization_id: organizationId
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const knowledgeData = result.data;

    // Forward the request to the Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/organization-knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeData)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to add organization knowledge', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logServerError('organization-knowledge POST API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 