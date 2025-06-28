import { NextResponse } from 'next/server';
import { metricsSupabaseDataAccess } from '@/app/dataAccess/metrics/supabase';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    console.log('Global admin metrics API called');
    console.log('Using Supabase metrics data access directly');
    
    const metrics = await metricsSupabaseDataAccess.getGlobalAdminMetrics();
    console.log('Metrics retrieved successfully:', metrics);

    return NextResponse.json(metrics);
  } catch (err) {
    console.error('Failed to fetch global admin metrics:', err);
    console.error('Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to fetch global admin metrics' }, { status: 500 });
  }
} 