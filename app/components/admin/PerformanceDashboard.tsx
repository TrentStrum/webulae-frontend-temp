'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  RefreshCw,
  Settings
} from 'lucide-react';
import { PerformanceService } from '@/app/lib/performanceService';
import { MemoryManager } from '@/app/lib/performanceService';

interface PerformanceMetrics {
  averageResponseTime: number;
  averageCacheHitRate: number;
  averageMemoryUsage: number;
  averageCpuUsage: number;
  averageErrorRate: number;
  averageThroughput: number;
  totalRequests: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  totalAccesses: number;
  averageTTL: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const performanceService = PerformanceService.getInstance();

  const fetchMetrics = async () => {
    setIsRefreshing(true);
    try {
      const analytics = performanceService.getAnalytics();
      const stats = performanceService.getStats();
      const memory = MemoryManager.getMemoryStats();

      setMetrics(analytics);
      setCacheStats(stats);
      setMemoryStats(memory);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceStatus = (metrics: PerformanceMetrics) => {
    const { averageResponseTime, averageErrorRate } = metrics;
    
    if (averageResponseTime < 100 && averageErrorRate < 0.01) {
      return { status: 'Excellent', color: 'bg-green-100 text-green-800' };
    }
    if (averageResponseTime < 500 && averageErrorRate < 0.05) {
      return { status: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { status: 'Needs Attention', color: 'bg-red-100 text-red-800' };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  const performanceStatus = getPerformanceStatus(metrics);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of system performance and resource usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Performance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={performanceStatus.color}>
              {performanceStatus.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Based on response time and error rate
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Response Time */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getResponseTimeColor(metrics.averageResponseTime)}`}>
                  {metrics.averageResponseTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalRequests} requests in last hour
                </p>
              </CardContent>
            </Card>

            {/* Throughput */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.averageThroughput.toFixed(1)} req/s
                </div>
                <p className="text-xs text-muted-foreground">
                  Average requests per second
                </p>
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metrics.averageErrorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatPercentage(metrics.averageErrorRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.averageErrorRate > 0.05 ? 'Above threshold' : 'Within normal range'}
                </p>
              </CardContent>
            </Card>

            {/* Cache Hit Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(metrics.averageCacheHitRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {cacheStats?.totalAccesses || 0} total accesses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Chart visualization would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cache Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cache Size</span>
                    <span className="font-medium">{cacheStats.size} / {cacheStats.maxSize}</span>
                  </div>
                  <Progress value={(cacheStats.size / cacheStats.maxSize) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <span>Hit Rate</span>
                    <span className="font-medium">{formatPercentage(cacheStats.hitRate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Total Accesses</span>
                    <span className="font-medium">{cacheStats.totalAccesses.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Average TTL</span>
                    <span className="font-medium">{(cacheStats.averageTTL / 1000).toFixed(0)}s</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cache Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => performanceService.clear()}
                  >
                    Clear Cache
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      performanceService.setConfig({ maxSize: 2000 });
                      fetchMetrics();
                    }}
                  >
                    Increase Cache Size
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      performanceService.setConfig({ defaultTTL: 10 * 60 * 1000 });
                      fetchMetrics();
                    }}
                  >
                    Extend TTL
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          {memoryStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Used Memory</span>
                    <span className="font-medium">{formatBytes(memoryStats.used)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Total Memory</span>
                    <span className="font-medium">{formatBytes(memoryStats.total)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Memory Limit</span>
                    <span className="font-medium">{formatBytes(memoryStats.limit)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Usage Ratio</span>
                      <span className="font-medium">{formatPercentage(memoryStats.usageRatio)}</span>
                    </div>
                    <Progress 
                      value={memoryStats.usageRatio * 100} 
                      className={memoryStats.usageRatio > 0.8 ? 'bg-red-100' : ''}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memory Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      MemoryManager.checkMemoryUsage();
                      fetchMetrics();
                    }}
                  >
                    Check Memory Usage
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      performanceService.clear();
                      fetchMetrics();
                    }}
                  >
                    Clear Performance Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.averageResponseTime > 500 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      High response time detected: {metrics.averageResponseTime.toFixed(0)}ms
                    </span>
                  </div>
                )}
                
                {metrics.averageErrorRate > 0.05 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">
                      High error rate detected: {formatPercentage(metrics.averageErrorRate)}
                    </span>
                  </div>
                )}
                
                {memoryStats && memoryStats.usageRatio > 0.8 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      High memory usage: {formatPercentage(memoryStats.usageRatio)}
                    </span>
                  </div>
                )}
                
                {(!metrics.averageResponseTime > 500 && !metrics.averageErrorRate > 0.05 && (!memoryStats || memoryStats.usageRatio <= 0.8)) && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      All systems operating normally
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 