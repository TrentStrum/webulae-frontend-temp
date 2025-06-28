import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { IntegrationService } from '@/app/lib/integrations/integrationService';
import { IntegrationApiResponse, IntegrationTemplate } from '@/app/types/integrations.types';

export async function GET(request: NextRequest): Promise<NextResponse<IntegrationApiResponse<IntegrationTemplate[]>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const integrationService = IntegrationService.getInstance();
    const templates = integrationService.getIntegrationTemplates();

    return NextResponse.json({
      success: true,
      data: templates,
      message: 'Integration templates retrieved successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
        executionTime: 0
      }
    });

  } catch (error) {
    console.error('Error fetching integration templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 