import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const MODULAR_SERVICE_URL = process.env.MODULAR_SERVICE_URL || 'http://localhost:8002';

// Define schema for request validation
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  system_prompt: z.string().optional(),
  user_prompt: z.string().optional()
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chat New API: Request received');
    }
    
    const { userId, orgId, sessionClaims } = getAuth(req);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chat New API: Auth result:', { userId, orgId });
    }
    
    if (!userId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Chat New API: Unauthorized - no userId');
      }
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    // Get user role from session claims
    const userRole = sessionClaims?.metadata?.role || 'org_member';
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chat New API: User role:', userRole);
    }

    // For global admin users, use a default organization ID if none is provided
    const effectiveOrgId = orgId || process.env.DEFAULT_ADMIN_ORG_ID || 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8';
    
    if (!effectiveOrgId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Chat New API: No organization context');
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
    
    const { message, system_prompt, user_prompt } = result.data;
    
    // Determine which endpoint to use based on whether prompts are provided
    const endpoint = system_prompt && user_prompt ? '/chat-with-prompts' : '/chat-new';
    
    // Prepare request payload
    const payload = {
      message,
      user_id: userId,
      organization_id: effectiveOrgId,
      user_role: userRole,
      ...(system_prompt && user_prompt && { system_prompt, user_prompt })
    };
    
    // Forward the request to the modular Python service with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response: Response;
    try {
      response = await fetch(`${MODULAR_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI service', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: endpoint
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('chat-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 