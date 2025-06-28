import { getPostDataAccess } from '@/app/config/backend';
import { NextResponse } from 'next/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

export const GET = withRateLimit(async () => {
  try {
    const dataAccess = getPostDataAccess();
    const posts = await dataAccess.getPublished();
    
    return NextResponse.json(posts, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // Cache for 5 minutes, stale for 10
      }
    });
  } catch (err) {
    logServerError('Failed to fetch published posts', err);
    return NextResponse.json(formatApiError(err), { status: 500 });
  }
}); 