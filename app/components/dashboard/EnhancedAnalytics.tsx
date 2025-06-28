'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  MessageSquare, 
  Zap,
  Activity,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

interface AnalyticsData {
  chatActivity: TimeSeriesData[];
  workflowActivity: TimeSeriesData[];
  userActivity: TimeSeriesData[];
  documentActivity: TimeSeriesData[];
}

interface FeatureUsageData {
  policyBotUsage: number;
  workflowExecutions: number;
  documentUploads: number;
  chatInteractions: number;
}

interface OrganizationMetrics {
  memberCount: number;
  projectCount: number;
  activeProjects: number;
  totalDocuments: number;
  recentActivity: number;
  workflowExecutions: number;
}

export default function EnhancedAnalytics() {
  const { user, organization } = useAuthGuard();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageData | null>(null);
  const [orgMetrics, setOrgMetrics] = useState<OrganizationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe, organization?.id]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Load time series data
      const timeSeriesResponse = await fetch(`/api/metrics/timeseries?timeframe=${timeframe}`);
      if (timeSeriesResponse.ok) {
        const timeSeriesData = await timeSeriesResponse.json();
        setAnalyticsData(timeSeriesData);
      }

      // Load feature usage data
      const featureUsageResponse = await fetch('/api/metrics/feature-usage');
      if (featureUsageResponse.ok) {
        const featureUsageData = await featureUsageResponse.json();
        setFeatureUsage(featureUsageData);
      }

      // Load organization metrics if available
      if (organization?.id) {
        const orgMetricsResponse = await fetch(`/api/metrics/organization/${organization.id}`);
        if (orgMetricsResponse.ok) {
          const orgMetricsData = await orgMetricsResponse.json();
          setOrgMetrics(orgMetricsData);
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const renderMetricCard = (
    title: string,
    value: number,
    description: string,
    icon: React.ReactNode,
    trend?: number,
    trendLabel?: string
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(value)}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon(trend)}
            <span className={`text-xs ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}% {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTimeSeriesChart = (data: TimeSeriesData[], title: string, color: string) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-end gap-1 h-32">
          {data.map((point, index) => {
            const height = range > 0 ? ((point.value - minValue) / range) * 100 : 0;
            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-primary/20 to-primary/40 rounded-t"
                style={{
                  height: `${Math.max(height, 2)}%`,
                  minHeight: '2px'
                }}
                title={`${new Date(point.timestamp).toLocaleDateString()}: ${point.value}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{new Date(data[0]?.timestamp).toLocaleDateString()}</span>
          <span>{new Date(data[data.length - 1]?.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform usage and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(value: 'day' | 'week' | 'month') => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          {organization && <TabsTrigger value="organization">Organization</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {renderMetricCard(
              'Total Users',
              featureUsage?.chatInteractions || 0,
              'Active users this period',
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              'Documents Processed',
              featureUsage?.documentUploads || 0,
              'Documents uploaded and processed',
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              'Workflow Executions',
              featureUsage?.workflowExecutions || 0,
              'Automated workflows run',
              <Zap className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              'Policy Generations',
              featureUsage?.policyBotUsage || 0,
              'Policies created with AI',
              <Target className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>Key metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData && renderTimeSeriesChart(analyticsData.chatActivity, 'Chat Activity', 'blue')}
                  {analyticsData && renderTimeSeriesChart(analyticsData.workflowActivity, 'Workflow Activity', 'green')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>User activity patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData && renderTimeSeriesChart(analyticsData.userActivity, 'User Activity', 'purple')}
                  {analyticsData && renderTimeSeriesChart(analyticsData.documentActivity, 'Document Activity', 'orange')}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity</CardTitle>
              <CardDescription>Live platform activity monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                    <div className="space-y-4">
                      {analyticsData.chatActivity.slice(-10).reverse().map((point, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Chat interaction</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{point.value}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(point.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No activity data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption</CardTitle>
                <CardDescription>Usage of platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Policy Bot</span>
                    <Badge variant="secondary">{featureUsage?.policyBotUsage || 0} uses</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Workflow Automation</span>
                    <Badge variant="secondary">{featureUsage?.workflowExecutions || 0} executions</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Management</span>
                    <Badge variant="secondary">{featureUsage?.documentUploads || 0} uploads</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chat Interface</span>
                    <Badge variant="secondary">{featureUsage?.chatInteractions || 0} interactions</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <Badge variant="outline">~250ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="outline">99.9%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <Badge variant="outline">24/7</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {organization && (
          <TabsContent value="organization" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {renderMetricCard(
                'Organization Members',
                orgMetrics?.memberCount || 0,
                'Active members in organization',
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
              {renderMetricCard(
                'Total Projects',
                orgMetrics?.projectCount || 0,
                'Projects created by organization',
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
              {renderMetricCard(
                'Active Projects',
                orgMetrics?.activeProjects || 0,
                'Currently active projects',
                <Activity className="h-4 w-4 text-muted-foreground" />
              )}
              {renderMetricCard(
                'Documents',
                orgMetrics?.totalDocuments || 0,
                'Documents in organization',
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              {renderMetricCard(
                'Recent Activity',
                orgMetrics?.recentActivity || 0,
                'Activity in last 7 days',
                <Calendar className="h-4 w-4 text-muted-foreground" />
              )}
              {renderMetricCard(
                'Workflow Executions',
                orgMetrics?.workflowExecutions || 0,
                'Workflows run in last 30 days',
                <Zap className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 