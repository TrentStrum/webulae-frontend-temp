import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AirtableDataAccess } from '@/app/dataAccess/airtable/duckDb';
import { AirtableApiResponse, AirtableConfig } from '@/app/types/airtable.types';

export async function GET(request: NextRequest): Promise<NextResponse<AirtableApiResponse<AirtableConfig[]>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const dataAccess = new AirtableDataAccess();
    await dataAccess.initialize();
    
    const configs = await dataAccess.getConfigsByOrganization(orgId);

    return NextResponse.json({
      success: true,
      data: configs,
      message: `Found ${configs.length} configurations`
    });

  } catch (error) {
    console.error('Error fetching Airtable configs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch configurations'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AirtableApiResponse<AirtableConfig>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey, baseId, baseName } = body;

    if (!apiKey || !baseId || !baseName) {
      return NextResponse.json({
        success: false,
        error: 'API key, base ID, and base name are required'
      }, { status: 400 });
    }

    const dataAccess = new AirtableDataAccess();
    await dataAccess.initialize();
    
    const config = await dataAccess.createConfig({
      organizationId: orgId,
      apiKey,
      baseId,
      baseName,
      isActive: true
    });

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Configuration created successfully'
    });

  } catch (error) {
    console.error('Error creating Airtable config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create configuration'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<AirtableApiResponse<AirtableConfig>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Configuration ID is required'
      }, { status: 400 });
    }

    const dataAccess = new AirtableDataAccess();
    await dataAccess.initialize();
    
    const config = await dataAccess.updateConfig(id, updates);

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating Airtable config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update configuration'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<AirtableApiResponse<boolean>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Configuration ID is required'
      }, { status: 400 });
    }

    const dataAccess = new AirtableDataAccess();
    await dataAccess.initialize();
    
    const success = await dataAccess.deleteConfig(id);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: true,
      message: 'Configuration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Airtable config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete configuration'
    }, { status: 500 });
  }
} 