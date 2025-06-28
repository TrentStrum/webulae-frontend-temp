import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { metricsSupabaseDataAccess } from '@/app/dataAccess/metrics/supabase';

export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    const { userId, orgId } = await getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const featureUsageData = await metricsSupabaseDataAccess.getFeatureUsageMetrics(orgId || undefined);

    return NextResponse.json(featureUsageData);

  } catch (error) {
    logServerError('GET /api/metrics/feature-usage', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 