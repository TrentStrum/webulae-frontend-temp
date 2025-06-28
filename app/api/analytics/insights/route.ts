import { NextRequest, NextResponse } from 'next/server';
import { AdvancedAnalyticsService } from '@/app/lib/advancedAnalyticsService';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || orgId;
    const timeframe = searchParams.get('timeframe') || '30_days';

    // Validate timeframe
    const validTimeframes = ['1_day', '7_days', '30_days', '90_days', '6_months', '1_year'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 });
    }

    const analyticsService = AdvancedAnalyticsService.getInstance();
    const insights = await analyticsService.generateInsights(organizationId, timeframe);

    return NextResponse.json({
      success: true,
      data: insights,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
        executionTime: Date.now(),
        modelVersion: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error generating analytics insights:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate analytics insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { organizationId = orgId, timeframe = '30_days', customFilters } = body;

    const analyticsService = AdvancedAnalyticsService.getInstance();
    
    // Generate insights with custom filters if provided
    const insights = await analyticsService.generateInsights(organizationId, timeframe);

    // Apply custom filters if provided
    if (customFilters) {
      // Filter insights based on custom criteria
      if (customFilters.severity) {
        insights.insights = insights.insights.filter(
          insight => customFilters.severity.includes(insight.severity)
        );
      }

      if (customFilters.type) {
        insights.insights = insights.insights.filter(
          insight => customFilters.type.includes(insight.type)
        );
      }

      if (customFilters.predictionType) {
        insights.predictions = insights.predictions.filter(
          prediction => customFilters.predictionType.includes(prediction.type)
        );
      }

      if (customFilters.recommendationPriority) {
        insights.recommendations = insights.recommendations.filter(
          recommendation => customFilters.recommendationPriority.includes(recommendation.priority)
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: insights,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
        executionTime: Date.now(),
        modelVersion: '1.0.0',
        filtersApplied: !!customFilters
      }
    });

  } catch (error) {
    console.error('Error generating custom analytics insights:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate custom analytics insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 