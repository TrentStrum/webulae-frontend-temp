'use client';
import React from 'react';
import { useMetricsService } from '@/app/hooks/useMetricsService';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Metrics(): React.ReactElement {
  const { useGetMetrics } = useMetricsService();
  const { data, isPending, isError } = useGetMetrics();

  if (isPending) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="h-32 bg-muted rounded"></div>
    </div>;
  }

  if (isError || !data) {
    return <p className="text-red-500">Failed to load metrics.</p>;
  }

  const chartData = [
    { name: 'Chat Count', value: data.chatCount },
    { name: 'Workflow Runs', value: data.workflowRuns },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usage Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Cards */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Chat Activity</h3>
          <p className="text-3xl font-bold">{data.chatCount}</p>
          <p className="text-sm text-muted-foreground">Total conversations</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Workflow Activity</h3>
          <p className="text-3xl font-bold">{data.workflowRuns}</p>
          <p className="text-sm text-muted-foreground">Total executions</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
