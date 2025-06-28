import { NextRequest, NextResponse } from 'next/server';
import { AdvancedAnalyticsService } from '@/app/lib/advancedAnalyticsService';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyticsService = AdvancedAnalyticsService.getInstance();
    
    // Get all available models
    const models = Array.from(analyticsService['models'].values());

    return NextResponse.json({
      success: true,
      data: models,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
        totalModels: models.length,
        modelVersion: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch AI models',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { modelId, trainingData } = body;

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    const analyticsService = AdvancedAnalyticsService.getInstance();
    const trainingResponse = await analyticsService.trainModel(modelId, trainingData || {});

    return NextResponse.json({
      success: true,
      data: trainingResponse,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9),
        modelId,
        modelVersion: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error training AI model:', error);
    return NextResponse.json(
      { 
        error: 'Failed to train AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 