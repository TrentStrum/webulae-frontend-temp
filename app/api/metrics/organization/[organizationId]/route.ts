import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { metricsSupabaseDataAccess } from '@/app/dataAccess/metrics/supabase';

export const GET = withRateLimit(async (
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) => {
  try {
    const { userId } = await getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const organizationId = params.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const orgMetrics = await metricsSupabaseDataAccess.getOrganizationMetrics(organizationId);

    return NextResponse.json(orgMetrics);

  } catch (error) {
    logServerError('GET /api/metrics/organization/[organizationId]', error);
    return NextResponse.json(
      formatApiError(error),
      { status: 500 }
    );
  }
}); 