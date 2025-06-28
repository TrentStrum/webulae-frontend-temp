import { getPostDataAccess } from '@/app/config/backend';
import { NextRequest, NextResponse } from 'next/server';
import { postSchema } from '@/app/schemas/postSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { NotFoundError } from '@/app/lib/dataAccess';

export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const postId = req.nextUrl.pathname.split('/').pop() || '';
    const post = await getPostDataAccess().getById(postId);
    
    return NextResponse.json(post, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' // Cache for 1 minute, stale for 5
      }
    });
  } catch (err) {
    logServerError('Failed to fetch post', err);
    
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: 'Post not found', status: 404 }, { status: 404 });
    }
    
    return NextResponse.json(formatApiError(err), { status: 500 });
  }
});

// Apply CSRF protection to state-changing operations
export const PUT = withRateLimit(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = postSchema.partial().safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    const postId = req.nextUrl.pathname.split('/').pop() || '';
    const updated = await getPostDataAccess().update(postId, parsed.data);
    
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    logServerError('Failed to update post', err);
    
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: 'Post not found', status: 404 }, { status: 404 });
    }
    
    return NextResponse.json(formatApiError(err), { status: 500 });
  }
});

export const DELETE = withRateLimit(async (req: NextRequest) => {
  try {
    const postId = req.nextUrl.pathname.split('/').pop() || '';
    await getPostDataAccess().delete(postId);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    logServerError('Failed to delete post', err);
    
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: 'Post not found', status: 404 }, { status: 404 });
    }
    
    return NextResponse.json(formatApiError(err), { status: 500 });
  }
});