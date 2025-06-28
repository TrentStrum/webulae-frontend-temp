import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const MODULAR_SERVICE_URL = process.env.MODULAR_SERVICE_URL || 'http://localhost:8002';

// Define schemas for request validation
const companyFAQSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
  priority: z.number().optional().default(1),
  is_active: z.boolean().optional().default(true)
});

const updateCompanyFAQSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.number().optional(),
  is_active: z.boolean().optional()
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company FAQs New API: Create request received');
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
    const result = companyFAQSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-faqs-new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to create company FAQ', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: '/company-faqs-new'
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-faqs-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const GET = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Company FAQs New API: Get all request received');
    }
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/company-faqs-new`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get company FAQs', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: '/company-faqs-new'
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('company-faqs-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 