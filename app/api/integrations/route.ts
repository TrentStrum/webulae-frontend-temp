import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { IntegrationService } from '@/app/lib/integrations/integrationService';
import { IntegrationApiResponse, Integration, IntegrationListResponse } from '@/app/types/integrations.types';

export async function GET(request: NextRequest): Promise<NextResponse<IntegrationApiResponse<IntegrationListResponse>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');

    // Mock data for demonstration
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        organizationId: orgId,
        name: 'Airtable Database',
        type: 'database',
        provider: 'airtable',
        status: 'active',
        config: {
          apiKey: '***',
          baseId: 'app1234567890'
        },
        metadata: {
          version: '1.0.0',
          capabilities: [
            { name: 'Read Data', description: 'Read records from tables', supported: true, requiresAuth: true },
            { name: 'Write Data', description: 'Create and update records', supported: true, requiresAuth: true }
          ],
          rateLimits: {
            requestsPerMinute: 5,
            requestsPerHour: 100,
            requestsPerDay: 1000
          },
          webhookSupport: false,
          realtimeSupport: false,
          dataTypes: ['records', 'tables', 'bases'],
          features: ['data_analysis', 'schema_discovery']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date().toISOString()
      },
      {
        id: '2',
        organizationId: orgId,
        name: 'Slack Notifications',
        type: 'communication',
        provider: 'slack',
        status: 'active',
        config: {
          accessToken: '***',
          botToken: '***'
        },
        metadata: {
          version: '1.0.0',
          capabilities: [
            { name: 'Send Messages', description: 'Send messages to channels', supported: true, requiresAuth: true },
            { name: 'Receive Webhooks', description: 'Receive webhook notifications', supported: true, requiresAuth: true }
          ],
          rateLimits: {
            requestsPerMinute: 50,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          webhookSupport: true,
          realtimeSupport: true,
          dataTypes: ['messages', 'channels', 'users'],
          features: ['message_sending', 'webhook_receiving']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filter integrations based on query parameters
    let filteredIntegrations = mockIntegrations;
    
    if (type) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.type === type);
    }
    
    if (provider) {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.provider === provider);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIntegrations = filteredIntegrations.slice(startIndex, endIndex);

    const response: IntegrationListResponse = {
      integrations: paginatedIntegrations,
      total: filteredIntegrations.length,
      page,
      limit,
      hasMore: endIndex < filteredIntegrations.length
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Integrations retrieved successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
        executionTime: 0
      }
    });

  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<IntegrationApiResponse<Integration>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, provider, config } = body;

    if (!name || !type || !provider || !config) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, type, provider, config'
      }, { status: 400 });
    }

    const integrationService = IntegrationService.getInstance();
    
    // Validate configuration
    const validationErrors = await integrationService.validateIntegrationConfig(provider, config);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Configuration validation failed',
        data: validationErrors
      }, { status: 400 });
    }

    // Create integration
    const newIntegration: Integration = {
      id: Math.random().toString(36).substr(2, 9),
      organizationId: orgId,
      name,
      type,
      provider,
      status: 'active',
      config,
      metadata: {
        version: '1.0.0',
        capabilities: [],
        webhookSupport: false,
        realtimeSupport: false,
        dataTypes: [],
        features: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newIntegration,
      message: 'Integration created successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
        executionTime: 0
      }
    });

  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 