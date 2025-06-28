'use client';
import React, { memo } from 'react';
import { useMetricsService } from '@/app/hooks/useMetricsService';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Memoized metric card component to prevent unnecessary re-renders
const MetricCard = memo(({ title, value, subtitle }: { title: string; value: number | string; subtitle: string }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </Card>
));

MetricCard.displayName = 'MetricCard';

// Memoized chart component to prevent unnecessary re-renders
const ActivityChart = memo(({ data }: { data: Array<{ name: string; value: number }> }) => (
  <div className="h-[300px]" aria-label="Activity chart">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

ActivityChart.displayName = 'ActivityChart';

export default function Metrics(): React.ReactElement {
  const { useGetDashboardMetrics } = useMetricsService();
  const { data, isPending, isError, error } = useGetDashboardMetrics();

  if (isPending) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading metrics">
        <Skeleton className="h-8 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 bg-muted rounded" />
          <Skeleton className="h-24 bg-muted rounded" />
          <Skeleton className="h-24 bg-muted rounded" />
        </div>
        <Skeleton className="h-64 bg-muted rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load metrics: {error?.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  const chartData = [
    { name: 'Chat Count', value: data.chatCount },
    { name: 'Workflow Runs', value: data.workflowRuns },
    { name: 'Documents', value: data.documentsProcessed },
    { name: 'Active Users', value: data.activeUsers },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usage Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Chat Activity" 
          value={data.chatCount} 
          subtitle="Total conversations" 
        />
        
        <MetricCard 
          title="Workflow Activity" 
          value={data.workflowRuns} 
          subtitle="Total executions" 
        />
        
        <MetricCard 
          title="Response Time" 
          value={`${data.averageResponseTime}ms`} 
          subtitle="Average response time" 
        />
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
        <ActivityChart data={chartData} />
      </Card>
    </div>
  );
}