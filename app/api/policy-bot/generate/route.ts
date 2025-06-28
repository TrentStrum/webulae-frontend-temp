import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PolicyGenerator } from '@/app/lib/policyBot/policyGenerator';
import { PolicyGenerationRequest, PolicyBotSettings } from '@/app/types/policyBot.types';
import { getPolicyTemplate, getAllPolicyTemplates } from '@/app/lib/policyBot/policyTemplates';

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const body: PolicyGenerationRequest = await request.json();
    
    // Validate request
    if (!body.template || !body.organizationId) {
      return NextResponse.json({ 
        error: 'Template and organization ID are required' 
      }, { status: 400 });
    }

    // Get default settings for the organization
    const settings: PolicyBotSettings = {
      organizationId: orgId,
      defaultTone: body.tone || 'professional',
      defaultLanguage: body.language || 'en',
      includeLegalLanguage: body.includeLegalLanguage || false,
      requireReview: true,
      autoVersioning: true,
      allowedTemplates: getAllPolicyTemplates(),
      customTemplates: [],
      complianceStandards: [],
      legalDisclaimer: ''
    };

    // Initialize policy generator
    const generator = new PolicyGenerator(settings);

    // Generate policy
    const result = await generator.generatePolicy({
      ...body,
      organizationId: orgId
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Policy generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate policy',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return available templates
    const templates = getAllPolicyTemplates();
    
    return NextResponse.json({
      templates,
      categories: [...new Set(templates.map(t => t.category))]
    });

  } catch (error) {
    console.error('Template fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 