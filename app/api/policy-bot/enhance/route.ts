import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, tone, language, sectionType } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Call the Python backend for AI enhancement
    const pythonResponse = await fetch(`${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}/enhance-policy-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'dev-key'}`
      },
      body: JSON.stringify({
        prompt,
        tone: tone || 'professional',
        language: language || 'en',
        section_type: sectionType,
        organization_id: orgId,
        user_id: userId
      })
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python service error: ${pythonResponse.statusText}`);
    }

    const data = await pythonResponse.json();
    
    return NextResponse.json({
      enhancedContent: data.enhanced_content,
      suggestions: data.suggestions || [],
      confidence: data.confidence || 0.8
    });

  } catch (error) {
    console.error('Content enhancement error:', error);
    
    // Return original content if enhancement fails
    return NextResponse.json({ 
      error: 'Failed to enhance content',
      details: error instanceof Error ? error.message : 'Unknown error',
      enhancedContent: null
    }, { status: 500 });
  }
} 