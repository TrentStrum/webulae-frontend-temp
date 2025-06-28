import { getPostDataAccess } from '@/app/config/backend';
import { NextRequest, NextResponse } from 'next/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

export const GET = withRateLimit(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const dataAccess = getPostDataAccess();
    const post = await dataAccess.getBySlug(params.slug);
    
    return NextResponse.json(post, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // Cache for 5 minutes, stale for 10
      }
    });
  } catch (err) {
    logServerError('Failed to fetch post by slug', err);
    return NextResponse.json(formatApiError(err), { status: 500 });
  }
}); 