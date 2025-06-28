import { NextRequest, NextResponse } from 'next/server';
import { getAuth, auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

// Define schema for request validation
const documentRequestSchema = z.object({
  content: z.string().min(1, "Document content is required")
});

export async function GET() {
  try {
    const { userId } = await auth();
    
    // Return mock documents data for development
    const mockDocuments = [
      {
        id: 'doc_1',
        name: 'Sample Document 1',
        content: 'This is a sample document for testing purposes.',
        created_at: new Date().toISOString(),
        user_id: userId || 'dev_user'
      },
      {
        id: 'doc_2',
        name: 'Sample Document 2',
        content: 'Another sample document for testing.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: userId || 'dev_user'
      }
    ];
    
    return NextResponse.json(mockDocuments);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withRateLimit(async (req: NextRequest): Promise<Response> => {
  try {
    const { userId } = getAuth(req);

    // Parse and validate request body
    let content: string | null | undefined;
    const type = req.headers.get('content-type') || '';
    
    if (type.startsWith('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        content = Buffer.from(await file.arrayBuffer()).toString('utf8');
      } else {
        content = (form.get('content') as string) ?? null;
      }
    } else {
      const body = await req.json();
      const result = documentRequestSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid request data', details: result.error.format(), status: 400 },
          { status: 400 }
        );
      }
      
      content = result.data.content;
    }

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided', status: 400 },
        { status: 400 }
      );
    }

    // Return mock response for development
    const mockResponse = {
      id: `doc_${Date.now()}`,
      content: content.substring(0, 100) + '...',
      user_id: userId || 'dev_user',
      created_at: new Date().toISOString(),
      status: 'processed'
    };
    
    return NextResponse.json(mockResponse, { status: 201 });
  } catch (err) {
    logServerError('documents POST', err);
    return NextResponse.json(
      formatApiError(err),
      { status: 500 }
    );
  }
});