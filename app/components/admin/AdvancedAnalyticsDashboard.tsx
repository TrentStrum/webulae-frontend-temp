'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  BarChart3, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAdvancedAnalytics } from '@/app/hooks/useAdvancedAnalytics';
import { Insight, Prediction, Recommendation, Anomaly, Trend } from '@/app/types/advancedAnalytics.types';

interface AdvancedAnalyticsDashboardProps {
  organizationId: string;
  timeframe?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdvancedAnalyticsDashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Something went wrong with the analytics dashboard. Please refresh the page or contact support.
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Error Details</summary>
                <pre className="mt-1 text-xs text-red-600">{this.state.error.message}</pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <Alert className="border-red-200 bg-red-50">
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800">
      <div className="flex items-center justify-between">
        <span>Failed to load analytics data: {error.message}</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </AlertDescription>
  </Alert>
);

const InsightCard = ({ insight }: { insight: Insight }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{insight.title}</CardTitle>
            <CardDescription className="mt-1">{insight.description}</CardDescription>
          </div>
          <Badge className={getSeverityColor(insight.severity)}>
            {insight.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confidence:</span>
            <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
              {(insight.confidence * 100).toFixed(0)}%
            </span>
          </div>
          
          {insight.data && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Current:</span>
                  <span className="ml-2 font-medium">{insight.data.currentValue?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Change:</span>
                  <span className={`ml-2 font-medium ${insight.data.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {insight.data.change > 0 ? '+' : ''}{insight.data.changePercentage?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {insight.recommendations && insight.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {insight.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <Lightbulb className="h-3 w-3 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PredictionCard = ({ prediction }: { prediction: Prediction }) => {
  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'user_growth': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'churn_prediction': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPredictionIcon(prediction.type)}
            <CardTitle className="text-lg">{prediction.target}</CardTitle>
          </div>
          <Badge variant="outline">
            {prediction.timeframe}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">
            {typeof prediction.value === 'number' 
              ? prediction.value.toLocaleString(undefined, { 
                  maximumFractionDigits: prediction.type === 'churn_prediction' ? 3 : 0 
                })
              : prediction.value
            }
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confidence:</span>
            <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
          </div>

          {prediction.range && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Range:</span>
                  <span className="ml-2 font-medium">
                    {prediction.range.min.toLocaleString()} - {prediction.range.max.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {prediction.factors && prediction.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Factors:</h4>
              <div className="space-y-1">
                {prediction.factors.slice(0, 3).map((factor, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center justify-between">
                    <span>{factor.variable}</span>
                    <span className={`font-medium ${factor.direction === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {factor.direction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{recommendation.title}</CardTitle>
            <CardDescription className="mt-1">{recommendation.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority}
            </Badge>
            {getStatusIcon(recommendation.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">ROI:</span>
              <span className="ml-2 font-medium text-green-600">{recommendation.roi}x</span>
            </div>
            <div>
              <span className="text-gray-600">Effort:</span>
              <span className="ml-2 font-medium">{recommendation.effort.level}</span>
            </div>
          </div>

          {recommendation.impact && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Expected Improvement:</span>
                  <span className="ml-2 font-medium">{recommendation.impact.expectedImprovement}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Timeframe:</span>
                  <span className="ml-2 font-medium">{recommendation.impact.timeframe}</span>
                </div>
              </div>
            </div>
          )}

          {recommendation.actions && recommendation.actions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Actions:</h4>
              <div className="space-y-2">
                {recommendation.actions.slice(0, 2).map((action, index) => (
                  <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-gray-600">{action.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AnomalyCard = ({ anomaly }: { anomaly: Anomaly }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <CardTitle className="text-lg">Anomaly Detected</CardTitle>
          </div>
          <Badge className={getSeverityColor(anomaly.severity)}>
            {anomaly.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Metric:</span>
              <span className="ml-2 font-medium">{anomaly.metric}</span>
            </div>
            <div>
              <span className="text-gray-600">Value:</span>
              <span className="ml-2 font-medium">{anomaly.value}</span>
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Expected:</span>
                <span className="ml-2 font-medium">{anomaly.expectedValue}</span>
              </div>
              <div>
                <span className="text-gray-600">Deviation:</span>
                <span className="ml-2 font-medium text-orange-600">
                  {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {anomaly.context && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Context:</h4>
              <div className="text-sm text-gray-600">
                <div>Time Window: {anomaly.context.timeWindow}</div>
                <div>User Segments: {anomaly.context.userSegments.join(', ')}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TrendCard = ({ trend }: { trend: Trend }) => {
  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getDirectionIcon(trend.direction)}
            <CardTitle className="text-lg">{trend.metric}</CardTitle>
          </div>
          <Badge variant="outline">
            {trend.strength}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Direction:</span>
              <span className="ml-2 font-medium capitalize">{trend.direction}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{trend.duration}</span>
            </div>
          </div>

          {trend.forecast && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Next Value:</span>
                  <span className="ml-2 font-medium">{trend.forecast.nextValue?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <span className="ml-2 font-medium">{(trend.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}

          {trend.seasonality && (
            <div className="text-sm">
              <span className="text-gray-600">Seasonality:</span>
              <span className="ml-2 font-medium">
                {trend.seasonality.hasSeasonality ? 'Present' : 'None detected'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdvancedAnalyticsDashboard({ 
  organizationId, 
  timeframe = '30_days' 
}: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('insights');
  const { data, isLoading, error, refetch } = useAdvancedAnalytics().useGetInsights(organizationId, timeframe);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleExport = useCallback(() => {
    if (!data) return;
    
    const exportData = {
      insights: data.insights,
      predictions: data.predictions,
      recommendations: data.recommendations,
      anomalies: data.anomalies,
      trends: data.trends,
      summary: data.summary,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${organizationId}-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, organizationId, timeframe]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No analytics data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalInsights}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.summary.criticalInsights}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{data.summary.actionableRecommendations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Predicted Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.summary.predictedValue?.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Advanced Analytics Dashboard</CardTitle>
                <CardDescription>
                  AI-powered insights, predictions, and recommendations for {timeframe.replace('_', ' ')}
                </CardDescription>
              </div>
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="insights">Insights ({data.insights.length})</TabsTrigger>
                <TabsTrigger value="predictions">Predictions ({data.predictions.length})</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations ({data.recommendations.length})</TabsTrigger>
                <TabsTrigger value="anomalies">Anomalies ({data.anomalies.length})</TabsTrigger>
                <TabsTrigger value="trends">Trends ({data.trends.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-4">
                {data.insights.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No insights available for this timeframe.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.insights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4">
                {data.predictions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No predictions available for this timeframe.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.predictions.map((prediction) => (
                      <PredictionCard key={prediction.id} prediction={prediction} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {data.recommendations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recommendations available for this timeframe.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.recommendations.map((recommendation) => (
                      <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="anomalies" className="space-y-4">
                {data.anomalies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No anomalies detected for this timeframe.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.anomalies.map((anomaly) => (
                      <AnomalyCard key={anomaly.id} anomaly={anomaly} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                {data.trends.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No trends detected for this timeframe.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.trends.map((trend) => (
                      <TrendCard key={trend.id} trend={trend} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
} 