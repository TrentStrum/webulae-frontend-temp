import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { getChatbotSettings, saveChatbotSettings } from '@/app/dataAccess/chatbot/settings';
import { ChatbotSettings } from '@/app/types/chatbot.types';

// Define schema for chatbot settings
const chatbotSettingsSchema = z.object({
  organization_id: z.string().min(1, "Organization ID is required"),
  allowed_services: z.array(z.string()).default([]),
  upselling_enabled: z.boolean().default(true),
  company_knowledge_enabled: z.boolean().default(true)
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

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required', status: 400 }, { status: 400 });
    }

    const settings = await getChatbotSettings(organizationId);
    return NextResponse.json(settings);
  } catch (error) {
    logServerError('chatbot settings GET', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    
    console.log('Session claims:', sessionClaims);
    console.log('User ID:', userId);
    console.log('Role from metadata:', sessionClaims?.metadata?.role);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    // Check if user is global admin
    const isGlobalAdmin = sessionClaims?.metadata?.role === 'global_admin';
    console.log('Is global admin:', isGlobalAdmin);
    
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }

    const body = await req.json();
    const result = chatbotSettingsSchema.safeParse(body);
    
    if (!result.success) {
      console.log('Validation failed:', result.error.format());
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }

    const settings: ChatbotSettings = result.data;
    const savedSettings = await saveChatbotSettings(settings);

    return NextResponse.json({ 
      message: 'Chatbot settings saved successfully',
      settings: savedSettings 
    });
  } catch (error) {
    logServerError('chatbot settings POST', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 