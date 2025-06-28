import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Use the new modular service on port 8001
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';

// Define schema for request validation
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required")
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chat API: Request received');
    }
    
    const { userId, orgId, sessionClaims } = getAuth(req);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chat API: Auth result:', { userId, orgId });
    }
    
    if (!userId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Chat API: Unauthorized - no userId');
      }
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Get user role from session claims
    const userRole = sessionClaims?.metadata?.role || 'org_member';
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chat API: User role:', userRole);
    }

    // For global admin users, use a default organization ID if none is provided
    // This allows them to access company knowledge RAG
    const effectiveOrgId = orgId || process.env.DEFAULT_ADMIN_ORG_ID || 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8';
    
    if (!effectiveOrgId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Chat API: No organization context');
      }
      return NextResponse.json(
        { error: 'No organization context', status: 400 },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = chatRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const { message } = result.data;
    
    // Forward the request to the Python service with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response: Response;
    try {
      // Use the new chat endpoint
      response = await fetch(`${PYTHON_SERVICE_URL}/chat-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          user_id: userId,
          organization_id: effectiveOrgId,
          user_role: userRole
        }),
        signal: controller.signal
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'AI service timeout', status: 504 },
          { status: 504 }
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI service', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logServerError('chat API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});