import { NextResponse } from 'next/server';
import { metricsSupabaseDataAccess } from '@/app/dataAccess/metrics/supabase';

export async function GET() {
  const metrics = await metricsSupabaseDataAccess.getDashboardMetrics();
  return NextResponse.json(metrics);
} 