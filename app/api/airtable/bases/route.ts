import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AirtableService } from '@/app/lib/airtable/airtableService';
import { AirtableApiResponse, AirtableBase } from '@/app/types/airtable.types';

export async function POST(request: NextRequest): Promise<NextResponse<AirtableApiResponse<AirtableBase[]>>> {
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

    // Get all bases for the user
    const airtableService = new AirtableService(apiKey);
    const bases = await airtableService.getBases();

    return NextResponse.json({
      success: true,
      data: bases,
      message: `Found ${bases.length} bases`
    });

  } catch (error) {
    console.error('Error fetching Airtable bases:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Airtable bases'
    }, { status: 500 });
  }
} 