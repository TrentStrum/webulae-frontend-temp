import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { metricsSupabaseDataAccess } from '@/app/dataAccess/metrics/supabase';

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
    const timeframe = (url.searchParams.get('timeframe') as 'day' | 'week' | 'month') || 'week';

    const timeSeriesData = await metricsSupabaseDataAccess.getTimeSeriesMetrics(timeframe);

    return NextResponse.json(timeSeriesData);

  } catch (error) {
    logServerError('GET /api/metrics/timeseries', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 