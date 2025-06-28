import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { N8nService } from '@/app/lib/n8n/n8nService';

// Schema for workflow execution
const workflowExecutionSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  userRole: z.string().min(1, 'User role is required'),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId, orgId } = await getAuth(req);
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = workflowExecutionSchema.parse(body);

    // Initialize n8n service
    const n8nService = new N8nService(validatedData.organizationId);
    
    // Execute the workflow
    const result = await n8nService.executeWorkflow(
      validatedData.workflowId,
      {
        data: validatedData.data || [{
          json: {
            message: validatedData.message || 'Executed via chat interface',
            userRole: validatedData.userRole,
            organizationId: validatedData.organizationId,
            userId,
            timestamp: new Date().toISOString()
          }
        }]
      },
      validatedData.userRole
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        executionId: result.executionId,
        message: 'Workflow executed successfully',
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Workflow execution failed'
      }, { status: 400 });
    }
  } catch (error) {
    logServerError('POST /api/org-admin/n8n/execute', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 