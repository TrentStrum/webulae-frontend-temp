import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AirtableDataAccess } from '@/app/dataAccess/airtable/duckDb';
import { AirtableApiResponse, DataAnalysisResponse } from '@/app/types/airtable.types';

export async function GET(request: NextRequest): Promise<NextResponse<AirtableApiResponse<DataAnalysisResponse[]>>> {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');
    if (!configId) {
      return NextResponse.json({
        success: false,
        error: 'Missing configId'
      }, { status: 400 });
    }

    const dataAccess = new AirtableDataAccess();
    await dataAccess.initialize();
    const config = await dataAccess.getConfigById(configId);
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      }, { status: 404 });
    }
    if (config.organizationId !== orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to configuration'
      }, { status: 403 });
    }

    const results = await dataAccess.getAnalysisResults(orgId, 10);
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analysis results'
    }, { status: 500 });
  }
} 