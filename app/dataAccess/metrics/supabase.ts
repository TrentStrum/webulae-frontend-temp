import { createServerSupabaseClient } from '@/app/lib/supabase/server';
import { Metrics, DashboardMetrics, GlobalAdminMetrics } from '@/app/types/metrics.types';

export class SupabaseMetricsDataAccess {
	async getMetrics(): Promise<Metrics> {
		const supabase = await createServerSupabaseClient();

		// Get project requests counts
		const { count: resolvedCount } = await supabase
			.from('project_requests')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'resolved');

		const { count: totalCount } = await supabase
			.from('project_requests')
			.select('*', { count: 'exact', head: true });

		return {
			chatCount: resolvedCount || 0,
			workflowRuns: totalCount || 0,
		};
	}

	async getDashboardMetrics(): Promise<DashboardMetrics> {
		const supabase = await createServerSupabaseClient();

		// Get various counts with better data sources
		const { count: chatCount } = await supabase
			.from('chat_messages')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

		const { count: workflowRuns } = await supabase
			.from('n8n_executions')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

		const { count: activeUsers } = await supabase
			.from('user_profiles')
			.select('*', { count: 'exact', head: true })
			.gte('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Active in last 7 days

		const { count: documentsProcessed } = await supabase
			.from('documents')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

		// Calculate average response time from chat messages
		const { data: recentMessages } = await supabase
			.from('chat_messages')
			.select('created_at, response_time')
			.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
			.not('response_time', 'is', null);

		const averageResponseTime = recentMessages && recentMessages.length > 0
			? recentMessages.reduce((sum, msg) => sum + (msg.response_time || 0), 0) / recentMessages.length
			: 250;

		return {
			chatCount: chatCount || 0,
			workflowRuns: workflowRuns || 0,
			activeUsers: activeUsers || 0,
			documentsProcessed: documentsProcessed || 0,
			averageResponseTime: Math.round(averageResponseTime),
		};
	}

	async getGlobalAdminMetrics(): Promise<GlobalAdminMetrics> {
		const supabase = await createServerSupabaseClient();

		// Get current counts
		const { count: totalUsers } = await supabase
			.from('user_profiles')
			.select('*', { count: 'exact', head: true });

		const { count: activeProjects } = await supabase
			.from('projects')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'active');

		const { count: totalOrganizations } = await supabase
			.from('organizations')
			.select('*', { count: 'exact', head: true });

		const { count: totalPosts } = await supabase
			.from('posts')
			.select('*', { count: 'exact', head: true });

		const { count: pendingAccessRequests } = await supabase
			.from('access_requests')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'pending');

		// Calculate trends (comparing current month vs previous month)
		const now = new Date();
		const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

		// User growth trend
		const { count: currentMonthUsers } = await supabase
			.from('user_profiles')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', currentMonthStart.toISOString());

		const { count: previousMonthUsers } = await supabase
			.from('user_profiles')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', previousMonthStart.toISOString())
			.lt('created_at', currentMonthStart.toISOString());

		const totalUsersTrend = previousMonthUsers > 0 
			? ((currentMonthUsers || 0) - previousMonthUsers) / previousMonthUsers * 100
			: 0;

		// Project growth trend
		const { count: currentMonthProjects } = await supabase
			.from('projects')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', currentMonthStart.toISOString());

		const { count: previousMonthProjects } = await supabase
			.from('projects')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', previousMonthStart.toISOString())
			.lt('created_at', currentMonthStart.toISOString());

		const activeProjectsTrend = previousMonthProjects > 0
			? ((currentMonthProjects || 0) - previousMonthProjects) / previousMonthProjects * 100
			: 0;

		// Organization growth trend
		const { count: currentMonthOrgs } = await supabase
			.from('organizations')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', currentMonthStart.toISOString());

		const { count: previousMonthOrgs } = await supabase
			.from('organizations')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', previousMonthStart.toISOString())
			.lt('created_at', currentMonthStart.toISOString());

		const totalOrganizationsTrend = previousMonthOrgs > 0
			? ((currentMonthOrgs || 0) - previousMonthOrgs) / previousMonthOrgs * 100
			: 0;

		// Post growth trend
		const { count: currentMonthPosts } = await supabase
			.from('posts')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', currentMonthStart.toISOString());

		const { count: previousMonthPosts } = await supabase
			.from('posts')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', previousMonthStart.toISOString())
			.lt('created_at', currentMonthStart.toISOString());

		const totalPostsTrend = previousMonthPosts > 0
			? ((currentMonthPosts || 0) - previousMonthPosts) / previousMonthPosts * 100
			: 0;

		return {
			totalUsers: totalUsers || 0,
			totalUsersTrend: Math.round(totalUsersTrend * 100) / 100,
			activeProjects: activeProjects || 0,
			activeProjectsTrend: Math.round(activeProjectsTrend * 100) / 100,
			totalOrganizations: totalOrganizations || 0,
			totalOrganizationsTrend: Math.round(totalOrganizationsTrend * 100) / 100,
			pendingAccessRequests: pendingAccessRequests || 0,
			totalPosts: totalPosts || 0,
			totalPostsTrend: Math.round(totalPostsTrend * 100) / 100,
		};
	}

	async getOrganizationMetrics(organizationId: string): Promise<{
		memberCount: number;
		projectCount: number;
		activeProjects: number;
		totalDocuments: number;
		recentActivity: number;
		workflowExecutions: number;
	}> {
		const supabase = await createServerSupabaseClient();

		const { count: memberCount } = await supabase
			.from('organization_members')
			.select('*', { count: 'exact', head: true })
			.eq('organizationId', organizationId)
			.eq('isActive', true);

		const { count: projectCount } = await supabase
			.from('projects')
			.select('*', { count: 'exact', head: true })
			.eq('organizationId', organizationId);

		const { count: activeProjects } = await supabase
			.from('projects')
			.select('*', { count: 'exact', head: true })
			.eq('organizationId', organizationId)
			.eq('status', 'active');

		const { count: totalDocuments } = await supabase
			.from('documents')
			.select('*', { count: 'exact', head: true })
			.eq('organizationId', organizationId);

		// Recent activity (last 7 days)
		const { count: recentActivity } = await supabase
			.from('chat_messages')
			.select('*', { count: 'exact', head: true })
			.eq('organizationId', organizationId)
			.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

		// Workflow executions (last 30 days)
		const { count: workflowExecutions } = await supabase
			.from('n8n_executions')
			.select('*', { count: 'exact', head: true })
			.eq('organizationId', organizationId)
			.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

		return {
			memberCount: memberCount || 0,
			projectCount: projectCount || 0,
			activeProjects: activeProjects || 0,
			totalDocuments: totalDocuments || 0,
			recentActivity: recentActivity || 0,
			workflowExecutions: workflowExecutions || 0,
		};
	}

	async getTimeSeriesMetrics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
		chatActivity: Array<{ timestamp: string; value: number }>;
		workflowActivity: Array<{ timestamp: string; value: number }>;
		userActivity: Array<{ timestamp: string; value: number }>;
		documentActivity: Array<{ timestamp: string; value: number }>;
	}> {
		const supabase = await createServerSupabaseClient();
		
		// Calculate date range based on timeframe
		const now = new Date();
		const dataPoints = timeframe === 'day' ? 24 : timeframe === 'week' ? 7 : 30;
		const intervalHours = timeframe === 'day' ? 1 : timeframe === 'week' ? 24 : 24 * 7;
		
		const startDate = new Date(now.getTime() - (dataPoints * intervalHours * 60 * 60 * 1000));

		// Get real chat activity data
		const { data: chatData } = await supabase
			.from('chat_messages')
			.select('created_at')
			.gte('created_at', startDate.toISOString());

		// Get real workflow activity data
		const { data: workflowData } = await supabase
			.from('n8n_executions')
			.select('created_at')
			.gte('created_at', startDate.toISOString());

		// Get real user activity data
		const { data: userData } = await supabase
			.from('user_profiles')
			.select('last_active')
			.gte('last_active', startDate.toISOString());

		// Get real document activity data
		const { data: documentData } = await supabase
			.from('documents')
			.select('created_at')
			.gte('created_at', startDate.toISOString());

		// Process data into time series
		const chatActivity = this.processTimeSeriesData(chatData, 'created_at', dataPoints, intervalHours);
		const workflowActivity = this.processTimeSeriesData(workflowData, 'created_at', dataPoints, intervalHours);
		const userActivity = this.processTimeSeriesData(userData, 'last_active', dataPoints, intervalHours);
		const documentActivity = this.processTimeSeriesData(documentData, 'created_at', dataPoints, intervalHours);

		return {
			chatActivity,
			workflowActivity,
			userActivity,
			documentActivity,
		};
	}

	private processTimeSeriesData(
		data: any[] | null, 
		dateField: string, 
		dataPoints: number, 
		intervalHours: number
	): Array<{ timestamp: string; value: number }> {
		if (!data || data.length === 0) {
			// Return empty data points
			return Array.from({ length: dataPoints }, (_, i) => ({
				timestamp: new Date(Date.now() - (dataPoints - i - 1) * intervalHours * 60 * 60 * 1000).toISOString(),
				value: 0,
			}));
		}

		// Group data by time intervals
		const groupedData = new Map<string, number>();
		const now = new Date();

		data.forEach(item => {
			const date = new Date(item[dateField]);
			const intervalIndex = Math.floor((now.getTime() - date.getTime()) / (intervalHours * 60 * 60 * 1000));
			const timestamp = new Date(now.getTime() - intervalIndex * intervalHours * 60 * 60 * 1000).toISOString();
			
			groupedData.set(timestamp, (groupedData.get(timestamp) || 0) + 1);
		});

		// Create time series array
		return Array.from({ length: dataPoints }, (_, i) => {
			const timestamp = new Date(now.getTime() - (dataPoints - i - 1) * intervalHours * 60 * 60 * 1000).toISOString();
			return {
				timestamp,
				value: groupedData.get(timestamp) || 0,
			};
		});
	}

	async getFeatureUsageMetrics(organizationId?: string): Promise<{
		policyBotUsage: number;
		workflowExecutions: number;
		documentUploads: number;
		chatInteractions: number;
	}> {
		const supabase = await createServerSupabaseClient();
		const now = new Date();
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Policy Bot usage
		let policyBotQuery = supabase
			.from('policy_generations')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', last30Days.toISOString());
		
		if (organizationId) {
			policyBotQuery = policyBotQuery.eq('organizationId', organizationId);
		}
		const { count: policyBotUsage } = await policyBotQuery;

		// Workflow executions
		let workflowQuery = supabase
			.from('n8n_executions')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', last30Days.toISOString());
		
		if (organizationId) {
			workflowQuery = workflowQuery.eq('organizationId', organizationId);
		}
		const { count: workflowExecutions } = await workflowQuery;

		// Document uploads
		let documentQuery = supabase
			.from('documents')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', last30Days.toISOString());
		
		if (organizationId) {
			documentQuery = documentQuery.eq('organizationId', organizationId);
		}
		const { count: documentUploads } = await documentQuery;

		// Chat interactions
		let chatQuery = supabase
			.from('chat_messages')
			.select('*', { count: 'exact', head: true })
			.gte('created_at', last30Days.toISOString());
		
		if (organizationId) {
			chatQuery = chatQuery.eq('organizationId', organizationId);
		}
		const { count: chatInteractions } = await chatQuery;

		return {
			policyBotUsage: policyBotUsage || 0,
			workflowExecutions: workflowExecutions || 0,
			documentUploads: documentUploads || 0,
			chatInteractions: chatInteractions || 0,
		};
	}
}

export const metricsSupabaseDataAccess = new SupabaseMetricsDataAccess();
