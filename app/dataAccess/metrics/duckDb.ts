import { db } from '@/app/lib/duckdb/serverConnection';
import { Metrics, DashboardMetrics } from '@/app/types/metrics.types';

export class DuckDbMetricsDataAccess {
  private table = 'metrics';

  async getMetrics(): Promise<Metrics> {
    return new Promise((resolve, reject) => {
      // Query chat count from chat logs (if we had a chat_logs table)
      // For now, we'll use a placeholder and get workflow runs from project_requests
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM project_requests WHERE status = 'resolved') as chatCount,
          (SELECT COUNT(*) FROM project_requests) as workflowRuns
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        const result = rows[0] as any;
        resolve({
          chatCount: result.chatCount || 0,
          workflowRuns: result.workflowRuns || 0,
        });
      });
    });
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM project_requests WHERE status = 'resolved') as chatCount,
          (SELECT COUNT(*) FROM project_requests) as workflowRuns,
          (SELECT COUNT(DISTINCT user_id) FROM projects) as activeUsers,
          (SELECT COUNT(*) FROM posts) as documentsProcessed,
          250 as averageResponseTime
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        const result = rows[0] as any;
        resolve({
          chatCount: result.chatCount || 0,
          workflowRuns: result.workflowRuns || 0,
          activeUsers: result.activeUsers || 0,
          documentsProcessed: result.documentsProcessed || 0,
          averageResponseTime: result.averageResponseTime || 0,
        });
      });
    });
  }

  async getGlobalAdminMetrics(): Promise<GlobalAdminMetrics> {
    return new Promise((resolve) => {
      // Temporary mock implementation while DuckDB driver issues are resolved
      console.log('Using mock getGlobalAdminMetrics implementation');
      
      // Return mock data based on what should be in the seeded database
      resolve({
        totalUsers: 25,
        totalUsersTrend: 0,
        activeProjects: 12,
        activeProjectsTrend: 0,
        totalOrganizations: 8,
        totalOrganizationsTrend: 0,
        pendingAccessRequests: 3,
        totalPosts: 45,
        totalPostsTrend: 0,
      });
    });
  }

  async getOrganizationMetrics(organizationId: string): Promise<{
    memberCount: number;
    projectCount: number;
    activeProjects: number;
    totalDocuments: number;
  }> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM organization_members WHERE organizationId = ? AND isActive = true) as memberCount,
          (SELECT COUNT(*) FROM projects WHERE organizationId = ?) as projectCount,
          (SELECT COUNT(*) FROM projects WHERE organizationId = ? AND status = 'active') as activeProjects,
          (SELECT COUNT(*) FROM posts) as totalDocuments
      `;
      
      db.all(query, [organizationId, organizationId, organizationId], (err, rows) => {
        if (err) return reject(err);
        const result = rows[0] as any;
        resolve({
          memberCount: result.memberCount || 0,
          projectCount: result.projectCount || 0,
          activeProjects: result.activeProjects || 0,
          totalDocuments: result.totalDocuments || 0,
        });
      });
    });
  }

  async getTimeSeriesMetrics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    chatActivity: Array<{ timestamp: string; value: number }>;
    workflowActivity: Array<{ timestamp: string; value: number }>;
    userActivity: Array<{ timestamp: string; value: number }>;
  }> {
    return new Promise((resolve, reject) => {
      // For now, return mock time series data
      // In a real implementation, you'd query actual timestamps from the database
      const now = new Date();
      const dataPoints = timeframe === 'day' ? 24 : timeframe === 'week' ? 7 : 30;
      
      const chatActivity = Array.from({ length: dataPoints }, (_, i) => ({
        timestamp: new Date(now.getTime() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 10) + 1,
      }));

      const workflowActivity = Array.from({ length: dataPoints }, (_, i) => ({
        timestamp: new Date(now.getTime() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 5) + 1,
      }));

      const userActivity = Array.from({ length: dataPoints }, (_, i) => ({
        timestamp: new Date(now.getTime() - (dataPoints - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 20) + 5,
      }));

      resolve({
        chatActivity,
        workflowActivity,
        userActivity,
      });
    });
  }
}

export const metricsDuckDBDataAccess = new DuckDbMetricsDataAccess(); 