import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const MODULAR_SERVICE_URL = process.env.MODULAR_SERVICE_URL || 'http://localhost:8002';

// Define schema for chatbot settings request validation
const chatbotSettingsSchema = z.object({
  organization_id: z.string().min(1, "Organization ID is required"),
  bot_name: z.string().optional().default("Assistant"),
  bot_personality: z.string().optional(),
  allowed_services: z.array(z.string()).optional(),
  upselling_enabled: z.boolean().optional().default(true),
  company_knowledge_enabled: z.boolean().optional().default(true)
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chatbot Settings New API: Create/Update request received');
    }
    
    const { userId, orgId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const effectiveOrgId = orgId || process.env.DEFAULT_ADMIN_ORG_ID || 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8';
    
    if (!effectiveOrgId) {
      return NextResponse.json(
        { error: 'No organization context', status: 400 },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = chatbotSettingsSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/chatbot-settings-new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...result.data,
        organization_id: effectiveOrgId
      })
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to update chatbot settings', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: '/chatbot-settings-new'
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('chatbot-settings-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const GET = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Chatbot Settings New API: Get request received');
    }
    
    const { userId, orgId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const effectiveOrgId = orgId || process.env.DEFAULT_ADMIN_ORG_ID || 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8';
    
    if (!effectiveOrgId) {
      return NextResponse.json(
        { error: 'No organization context', status: 400 },
        { status: 400 }
      );
    }

    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/chatbot-settings-new/${effectiveOrgId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to get chatbot settings', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: `/chatbot-settings-new/${effectiveOrgId}`
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('chatbot-settings-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 