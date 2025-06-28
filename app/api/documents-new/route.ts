import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

const MODULAR_SERVICE_URL = process.env.MODULAR_SERVICE_URL || 'http://localhost:8002';

// Define schema for document upload request validation
const documentUploadSchema = z.object({
  content: z.string().min(1, "Document content is required"),
  document_name: z.string().optional().default("uploaded_document"),
  chunk_size: z.number().optional().default(400),
  overlap: z.number().optional().default(50),
  document_type: z.string().optional().default("organization")
});

// Define schema for document deletion request validation
const documentDeleteSchema = z.object({
  document_name: z.string().min(1, "Document name is required")
});

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Documents New API: Upload request received');
    }
    
    const { userId, orgId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const effectiveOrgId = orgId || process.env.DEFAULT_ADMIN_ORG_ID || 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8';
    
    if (!effectiveOrgId) {
      return NextResponse.json(
        { error: 'No organization context', status: 400 },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = documentUploadSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const { content, document_name, chunk_size, overlap, document_type } = result.data;
    
    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/documents-new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        organization_id: effectiveOrgId,
        content,
        document_name,
        chunk_size,
        overlap,
        document_type
      })
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to upload document', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: '/documents-new'
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('documents-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
});

export const DELETE = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Documents New API: Delete request received');
    }
    
    const { userId, orgId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const effectiveOrgId = orgId || process.env.DEFAULT_ADMIN_ORG_ID || 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8';
    
    if (!effectiveOrgId) {
      return NextResponse.json(
        { error: 'No organization context', status: 400 },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = documentDeleteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const { document_name } = result.data;
    
    // Forward the request to the modular Python service
    const response = await fetch(`${MODULAR_SERVICE_URL}/documents-new`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: effectiveOrgId,
        document_name
      })
    });

    if (!response.ok) {
      const error = await response.text().catch(() => ({}));
      console.error('Modular Python service error:', error);
      return NextResponse.json(
        { error: 'Failed to delete document', status: response.status },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Add architecture info to response
    const enhancedData = {
      ...data,
      architecture: 'modular',
      endpoint: '/documents-new'
    };
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    logServerError('documents-new API', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 