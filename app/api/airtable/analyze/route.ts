import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AirtableService } from '@/app/lib/airtable/airtableService';
import { AirtableDataAccess } from '@/app/dataAccess/airtable/duckDb';
import { AirtableApiResponse, DataAnalysisRequest, DataAnalysisResponse } from '@/app/types/airtable.types';

export async function POST(request: NextRequest): Promise<NextResponse<AirtableApiResponse<DataAnalysisResponse>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { configId, query, tableId, filters, limit, sortBy } = body;

    if (!configId || !query || !tableId) {
      return NextResponse.json({
        success: false,
        error: 'Configuration ID, query, and table ID are required'
      }, { status: 400 });
    }

    // Get the Airtable configuration
    const dataAccess = new AirtableDataAccess();
    await dataAccess.initialize();
    
    const config = await dataAccess.getConfigById(configId);
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      }, { status: 404 });
    }

    // Verify the config belongs to the organization
    if (config.organizationId !== orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to configuration'
      }, { status: 403 });
    }

    // Create Airtable service and analyze data
    const airtableService = new AirtableService(config.apiKey, config.baseId);
    
    const analysisRequest: DataAnalysisRequest = {
      query,
      tableId,
      filters,
      limit,
      sortBy
    };

    const analysis = await airtableService.analyzeData(analysisRequest);

    // Store the analysis result
    await dataAccess.storeAnalysisResult(orgId, configId, analysis);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: 'Analysis completed successfully'
    });

  } catch (error) {
    console.error('Error analyzing Airtable data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze data'
    }, { status: 500 });
  }
} 