export type Metrics = {
  chatCount: number;
  workflowRuns: number;
};

export type DashboardMetrics = Metrics & {
  activeUsers: number;
  documentsProcessed: number;
  averageResponseTime: number;
};

export interface MetricsTimeframe {
  start: string;
  end: string;
  interval: 'day' | 'week' | 'month';
}

export interface TimeSeriesMetric {
  timestamp: string;
  value: number;
}

export interface MetricsTimeSeries {
  chatActivity: TimeSeriesMetric[];
  workflowActivity: TimeSeriesMetric[];
  userActivity: TimeSeriesMetric[];
}

export interface GlobalAdminMetrics {
  totalUsers: number;
  totalUsersTrend: number;
  activeProjects: number;
  activeProjectsTrend: number;
  totalOrganizations: number;
  totalOrganizationsTrend: number;
  pendingAccessRequests: number;
  totalPosts: number;
  totalPostsTrend: number;
}

export interface OrganizationMetrics {
  memberCount: number;
  projectCount: number;
  activeProjects: number;
  totalDocuments: number;
}