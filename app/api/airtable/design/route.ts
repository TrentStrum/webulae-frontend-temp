import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AirtableService } from '@/app/lib/airtable/airtableService';
import { AirtableApiResponse, DatabaseDesignRequest, DatabaseDesignResponse } from '@/app/types/airtable.types';

export async function POST(request: NextRequest): Promise<NextResponse<AirtableApiResponse<DatabaseDesignResponse>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      businessDescription, 
      goals, 
      currentProcesses, 
      dataSources, 
      teamSize, 
      industry 
    } = body;

    if (!businessDescription || !goals || !industry) {
      return NextResponse.json({
        success: false,
        error: 'Business description, goals, and industry are required'
      }, { status: 400 });
    }

    // Create a mock Airtable service (we don't need API key for design suggestions)
    const airtableService = new AirtableService('mock-key');
    
    const designRequest: DatabaseDesignRequest = {
      businessDescription,
      goals,
      currentProcesses: currentProcesses || [],
      dataSources: dataSources || [],
      teamSize: teamSize || 1,
      industry
    };

    const design = await airtableService.generateDatabaseDesign(designRequest);

    return NextResponse.json({
      success: true,
      data: design,
      message: 'Database design generated successfully'
    });

  } catch (error) {
    console.error('Error generating database design:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate database design'
    }, { status: 500 });
  }
} 