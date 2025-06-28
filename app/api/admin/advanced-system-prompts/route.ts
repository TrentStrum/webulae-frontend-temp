import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { AdvancedPromptService, PromptContext } from '@/app/lib/advancedPromptService';
import { PerformanceService } from '@/app/lib/performanceService';

export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const organizationId = url.searchParams.get('organizationId');
    const includeAnalytics = url.searchParams.get('analytics') === 'true';

    // Use performance service to measure execution time
    const { result: prompts, executionTime } = await PerformanceService.measureExecutionTime(
      async () => {
        // Mock data for demonstration - in real implementation, fetch from database
        return [
          {
            id: '1',
            prompt_name: 'Dynamic Welcome Message',
            content: 'Hello {{user_name}}! Welcome to {{organization_name}}. Your role is {{user_role}}.',
            category: 'Dynamic Content',
            priority: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            variables: [
              {
                name: 'user_name',
                type: 'string',
                description: 'User\'s display name',
                required: true
              },
              {
                name: 'organization_name',
                type: 'string',
                description: 'Organization name',
                required: true
              },
              {
                name: 'user_role',
                type: 'string',
                description: 'User\'s role in the organization',
                required: true
              }
            ],
            conditions: [
              {
                field: 'user_role',
                operator: 'equals',
                value: 'org_member'
              }
            ],
            template_type: 'dynamic',
            tags: ['welcome', 'personalized']
          },
          {
            id: '2',
            prompt_name: 'Admin-Only Instructions',
            content: 'You have administrative privileges. You can manage users, documents, and system settings.',
            category: 'Conditional Logic',
            priority: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            conditions: [
              {
                field: 'user_role',
                operator: 'contains',
                value: 'admin'
              }
            ],
            template_type: 'conditional',
            tags: ['admin', 'privileges']
          }
        ];
      },
      'Fetch advanced system prompts'
    );

    // Generate analytics if requested
    let analytics = null;
    if (includeAnalytics) {
      analytics = prompts.map(prompt => 
        AdvancedPromptService.generatePromptAnalytics(prompt.id, [
          { response_time: 150, satisfaction_score: 4.5, success: true, created_at: new Date().toISOString() },
          { response_time: 200, satisfaction_score: 4.2, success: true, created_at: new Date().toISOString() }
        ])
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        prompts,
        analytics,
        executionTime,
        totalCount: prompts.length
      }
    });

  } catch (error) {
    logServerError('GET /api/admin/advanced-system-prompts', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId } = await getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { prompt, testContext } = body;

    // Validate prompt structure
    if (!prompt.prompt_name || !prompt.content) {
      return NextResponse.json(
        { error: 'Prompt name and content are required' },
        { status: 400 }
      );
    }

    // Test prompt with provided context
    let testResults = null;
    if (testContext) {
      const mockPrompt = {
        ...prompt,
        id: 'test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const processedPrompt = AdvancedPromptService.buildDynamicPrompt([mockPrompt], testContext);
      
      // Validate variables if present
      let validationErrors: string[] = [];
      if (prompt.variables) {
        const validation = AdvancedPromptService.validatePromptVariables(prompt.variables, testContext);
        validationErrors = validation.errors;
      }

      testResults = {
        processedPrompt,
        validationErrors,
        variableCount: prompt.variables?.length || 0,
        conditionCount: prompt.conditions?.length || 0
      };
    }

    // In real implementation, save to database
    const savedPrompt = {
      ...prompt,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        prompt: savedPrompt,
        testResults
      },
      message: 'Advanced system prompt created successfully'
    });

  } catch (error) {
    logServerError('POST /api/admin/advanced-system-prompts', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 