'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { DataAnalysisResponse } from '@/app/types/airtable.types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalysisResultsProps {
  configId: string;
}

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
];

function renderChart(viz: any) {
  const { chartType, xAxis, yAxis, colorBy } = viz.config || {};
  const data = viz.data || [];
  if (!data || data.length === 0) return <div className="text-xs text-muted-foreground">No data for chart.</div>;

  switch (chartType) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <XAxis dataKey={xAxis || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxis || 'value'} fill='#8884d8'>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <XAxis dataKey={xAxis || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type='monotone' dataKey={yAxis || 'value'} stroke='#8884d8' />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxis || 'value'}
              nameKey={xAxis || 'name'}
              cx='50%'
              cy='50%'
              outerRadius={80}
              fill='#8884d8'
              label
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return <div className="text-xs text-muted-foreground">Chart type not supported yet.</div>;
  }
}

export function AnalysisResults({ configId }: AnalysisResultsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['airtable', 'analysis-results', configId],
    queryFn: async () => {
      const res = await fetch(`/api/airtable/analysis-results?configId=${configId}`);
      if (!res.ok) throw new Error('Failed to fetch analysis results');
      return res.json();
    },
    enabled: !!configId,
  });

  if (isLoading) {
    return <div className="text-muted-foreground animate-pulse">Loading analysis results...</div>;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load analysis results. Please try again later.</AlertDescription>
      </Alert>
    );
  }
  if (!data?.success || !data.data?.length) {
    return <div className="text-muted-foreground">No analysis results yet. Run an analysis to see results here.</div>;
  }

  return (
    <div className="space-y-4">
      {data.data.map((result: DataAnalysisResponse, idx: number) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{result.query}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              {result.results?.map((r, i) => (
                <div key={i} className="mb-2">
                  <Badge className="mr-2">{r.type}</Badge>
                  <span className="font-medium">{r.title}</span>
                  <div className="text-sm text-muted-foreground">{r.description}</div>
                </div>
              ))}
            </div>
            {result.insights?.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold">Insights:</div>
                <ul className="list-disc ml-6">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{insight.title}:</span> {insight.description}
                      {insight.actionable && insight.actionItems && (
                        <ul className="list-disc ml-6 text-xs text-green-700">
                          {insight.actionItems.map((item, j) => <li key={j}>{item}</li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Visualizations */}
            {result.visualizations?.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold mb-2">Visualizations:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.visualizations.map((viz, i) => (
                    <Card key={i} className="bg-muted">
                      <CardContent className="p-2">
                        <div className="font-medium mb-1">{viz.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{viz.type} ({viz.config.chartType})</div>
                        {renderChart(viz)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 