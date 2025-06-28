import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AirtableService } from '@/app/lib/airtable/airtableService';
import { AirtableApiResponse, AirtableConnectionTest } from '@/app/types/airtable.types';

export async function POST(request: NextRequest): Promise<NextResponse<AirtableApiResponse<AirtableConnectionTest>>> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 400 });
    }

    // Test the Airtable connection
    const airtableService = new AirtableService(apiKey);
    const connectionTest = await airtableService.testConnection();

    if (!connectionTest.isValid) {
      return NextResponse.json({
        success: false,
        error: connectionTest.error || 'Failed to connect to Airtable'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: connectionTest,
      message: 'Airtable connection successful'
    });

  } catch (error) {
    console.error('Error testing Airtable connection:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 