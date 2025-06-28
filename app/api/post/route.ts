import { getPostDataAccess } from '@/app/config/backend';
import { NextRequest, NextResponse } from 'next/server';
import { postSchema } from '@/app/schemas/postSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const published = searchParams.get('published');
    
    const dataAccess = getPostDataAccess();
    let posts;
    
    if (published === 'true') {
      posts = await dataAccess.getPublished();
    } else {
      posts = await dataAccess.getAll();
    }
    
    return NextResponse.json(posts, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' // Cache for 1 minute, stale for 5
      }
    });
  } catch (err) {
    logServerError('Failed to fetch posts', err);
    return NextResponse.json(formatApiError(err), { status: 500 });
  }
});

// Apply CSRF protection to state-changing operations
export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const dataAccess = getPostDataAccess();
    const created = await dataAccess.create(parsed.data);
    
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    logServerError('Failed to create post', err);
    return NextResponse.json(formatApiError(err), { status: 500 });
  }
});