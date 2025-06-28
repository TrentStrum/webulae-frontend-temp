import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { CreateFAQRequest, UpdateFAQRequest } from '@/app/types/faq.types';

// Define schema for FAQ validation
const createFAQSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
  priority: z.number().int().min(1).max(10).optional().default(1),
  is_active: z.boolean().optional().default(true)
});

const updateFAQSchema = z.object({
  question: z.string().min(1, "Question is required").optional(),
  answer: z.string().min(1, "Answer is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
  tags: z.array(z.string()).optional(),
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
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-faqs`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('company faqs GET', error);
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
    const result = createFAQSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }

    // Forward request to Python service
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_SERVICE_URL}/company-faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python service error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('company faqs POST', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 