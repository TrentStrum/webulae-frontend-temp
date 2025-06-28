import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AnalyticsInsightResponse, 
  AnalyticsConfig, 
  AIModel, 
  ModelTrainingResponse,
  Recommendation,
  RecommendationStatus
} from '@/app/types/advancedAnalytics.types';

// API endpoints
const API_BASE = '/api/analytics';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  insights: (orgId: string, timeframe: string) => [...analyticsKeys.all, 'insights', orgId, timeframe] as const,
  config: (orgId: string) => [...analyticsKeys.all, 'config', orgId] as const,
  models: () => [...analyticsKeys.all, 'models'] as const,
  modelPerformance: (modelId: string) => [...analyticsKeys.all, 'model', modelId] as const,
  recommendations: (orgId: string) => [...analyticsKeys.all, 'recommendations', orgId] as const,
};

// API functions
const analyticsAPI = {
  // Get insights
  async getInsights(organizationId: string, timeframe: string = '30_days'): Promise<AnalyticsInsightResponse> {
    const response = await fetch(`${API_BASE}/insights?organizationId=${organizationId}&timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics insights');
    }
    return response.json();
  },

  // Get configuration
  async getConfig(organizationId: string): Promise<AnalyticsConfig> {
    const response = await fetch(`${API_BASE}/config/${organizationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics configuration');
    }
    return response.json();
  },

  // Update configuration
  async updateConfig(organizationId: string, config: Partial<AnalyticsConfig>): Promise<AnalyticsConfig> {
    const response = await fetch(`${API_BASE}/config/${organizationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error('Failed to update analytics configuration');
    }
    return response.json();
  },

  // Get all models
  async getModels(): Promise<AIModel[]> {
    const response = await fetch(`${API_BASE}/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch AI models');
    }
    return response.json();
  },

  // Get model performance
  async getModelPerformance(modelId: string): Promise<AIModel> {
    const response = await fetch(`${API_BASE}/models/${modelId}/performance`);
    if (!response.ok) {
      throw new Error('Failed to fetch model performance');
    }
    return response.json();
  },

  // Train model
  async trainModel(modelId: string, trainingData: any): Promise<ModelTrainingResponse> {
    const response = await fetch(`${API_BASE}/models/${modelId}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainingData),
    });
    if (!response.ok) {
      throw new Error('Failed to start model training');
    }
    return response.json();
  },

  // Update recommendation status
  async updateRecommendationStatus(
    organizationId: string, 
    recommendationId: string, 
    status: RecommendationStatus
  ): Promise<Recommendation> {
    const response = await fetch(`${API_BASE}/recommendations/${organizationId}/${recommendationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update recommendation status');
    }
    return response.json();
  },

  // Export analytics data
  async exportData(organizationId: string, format: 'csv' | 'json' | 'pdf' = 'json'): Promise<Blob> {
    const response = await fetch(`${API_BASE}/export?organizationId=${organizationId}&format=${format}`);
    if (!response.ok) {
      throw new Error('Failed to export analytics data');
    }
    return response.blob();
  },

  // Get real-time metrics
  async getRealTimeMetrics(organizationId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/realtime/${organizationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch real-time metrics');
    }
    return response.json();
  },

  // Create custom metric
  async createCustomMetric(organizationId: string, metric: any): Promise<any> {
    const response = await fetch(`${API_BASE}/metrics/${organizationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    });
    if (!response.ok) {
      throw new Error('Failed to create custom metric');
    }
    return response.json();
  },

  // Get custom metrics
  async getCustomMetrics(organizationId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE}/metrics/${organizationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch custom metrics');
    }
    return response.json();
  }
};

// React Query hooks
export const useAdvancedAnalytics = () => {
  const queryClient = useQueryClient();

  // Get insights
  const useGetInsights = (organizationId: string, timeframe: string = '30_days') => {
    return useQuery({
      queryKey: analyticsKeys.insights(organizationId, timeframe),
      queryFn: () => analyticsAPI.getInsights(organizationId, timeframe),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!organizationId,
    });
  };

  // Get configuration
  const useGetConfig = (organizationId: string) => {
    return useQuery({
      queryKey: analyticsKeys.config(organizationId),
      queryFn: () => analyticsAPI.getConfig(organizationId),
      staleTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!organizationId,
    });
  };

  // Update configuration
  const useUpdateConfig = () => {
    return useMutation({
      mutationFn: ({ organizationId, config }: { organizationId: string; config: Partial<AnalyticsConfig> }) =>
        analyticsAPI.updateConfig(organizationId, config),
      onSuccess: (data, { organizationId }) => {
        queryClient.setQueryData(analyticsKeys.config(organizationId), data);
        queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      },
    });
  };

  // Get models
  const useGetModels = () => {
    return useQuery({
      queryKey: analyticsKeys.models(),
      queryFn: analyticsAPI.getModels,
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  // Get model performance
  const useGetModelPerformance = (modelId: string) => {
    return useQuery({
      queryKey: analyticsKeys.modelPerformance(modelId),
      queryFn: () => analyticsAPI.getModelPerformance(modelId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!modelId,
    });
  };

  // Train model
  const useTrainModel = () => {
    return useMutation({
      mutationFn: ({ modelId, trainingData }: { modelId: string; trainingData: any }) =>
        analyticsAPI.trainModel(modelId, trainingData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: analyticsKeys.models() });
      },
    });
  };

  // Update recommendation status
  const useUpdateRecommendationStatus = () => {
    return useMutation({
      mutationFn: ({ 
        organizationId, 
        recommendationId, 
        status 
      }: { 
        organizationId: string; 
        recommendationId: string; 
        status: RecommendationStatus 
      }) => analyticsAPI.updateRecommendationStatus(organizationId, recommendationId, status),
      onSuccess: (data, { organizationId }) => {
        queryClient.invalidateQueries({ 
          queryKey: analyticsKeys.insights(organizationId, '30_days') 
        });
        queryClient.invalidateQueries({ 
          queryKey: analyticsKeys.recommendations(organizationId) 
        });
      },
    });
  };

  // Export data
  const useExportData = () => {
    return useMutation({
      mutationFn: ({ organizationId, format }: { organizationId: string; format: 'csv' | 'json' | 'pdf' }) =>
        analyticsAPI.exportData(organizationId, format),
    });
  };

  // Get real-time metrics
  const useGetRealTimeMetrics = (organizationId: string) => {
    return useQuery({
      queryKey: [...analyticsKeys.all, 'realtime', organizationId],
      queryFn: () => analyticsAPI.getRealTimeMetrics(organizationId),
      refetchInterval: 30000, // Refresh every 30 seconds
      enabled: !!organizationId,
    });
  };

  // Create custom metric
  const useCreateCustomMetric = () => {
    return useMutation({
      mutationFn: ({ organizationId, metric }: { organizationId: string; metric: any }) =>
        analyticsAPI.createCustomMetric(organizationId, metric),
      onSuccess: (data, { organizationId }) => {
        queryClient.invalidateQueries({ 
          queryKey: [...analyticsKeys.all, 'metrics', organizationId] 
        });
      },
    });
  };

  // Get custom metrics
  const useGetCustomMetrics = (organizationId: string) => {
    return useQuery({
      queryKey: [...analyticsKeys.all, 'metrics', organizationId],
      queryFn: () => analyticsAPI.getCustomMetrics(organizationId),
      staleTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!organizationId,
    });
  };

  // Refresh insights
  const refreshInsights = (organizationId: string, timeframe: string = '30_days') => {
    queryClient.invalidateQueries({ 
      queryKey: analyticsKeys.insights(organizationId, timeframe) 
    });
  };

  // Refresh all analytics data
  const refreshAllAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
  };

  return {
    // Queries
    useGetInsights,
    useGetConfig,
    useGetModels,
    useGetModelPerformance,
    useGetRealTimeMetrics,
    useGetCustomMetrics,

    // Mutations
    useUpdateConfig,
    useTrainModel,
    useUpdateRecommendationStatus,
    useExportData,
    useCreateCustomMetric,

    // Utilities
    refreshInsights,
    refreshAllAnalytics,
  };
};

// Specialized hooks for specific use cases
export const useAnalyticsInsights = (organizationId: string, timeframe: string = '30_days') => {
  const { useGetInsights } = useAdvancedAnalytics();
  return useGetInsights(organizationId, timeframe);
};

export const useAnalyticsConfig = (organizationId: string) => {
  const { useGetConfig, useUpdateConfig } = useAdvancedAnalytics();
  const { data: config, isLoading, error } = useGetConfig(organizationId);
  const updateConfigMutation = useUpdateConfig();

  return {
    config,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    updateError: updateConfigMutation.error,
  };
};

export const useAIModels = () => {
  const { useGetModels, useGetModelPerformance, useTrainModel } = useAdvancedAnalytics();
  const { data: models, isLoading, error } = useGetModels();
  const trainModelMutation = useTrainModel();

  return {
    models,
    isLoading,
    error,
    trainModel: trainModelMutation.mutate,
    isTraining: trainModelMutation.isPending,
    trainingError: trainModelMutation.error,
    getModelPerformance: useGetModelPerformance,
  };
};

export const useAnalyticsRecommendations = (organizationId: string) => {
  const { useGetInsights, useUpdateRecommendationStatus } = useAdvancedAnalytics();
  const { data: insights, isLoading, error } = useGetInsights(organizationId, '30_days');
  const updateStatusMutation = useUpdateRecommendationStatus();

  return {
    recommendations: insights?.recommendations || [],
    insights: insights?.insights || [],
    predictions: insights?.predictions || [],
    anomalies: insights?.anomalies || [],
    trends: insights?.trends || [],
    summary: insights?.summary,
    isLoading,
    error,
    updateRecommendationStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    updateError: updateStatusMutation.error,
  };
};

export const useRealTimeAnalytics = (organizationId: string) => {
  const { useGetRealTimeMetrics } = useAdvancedAnalytics();
  return useGetRealTimeMetrics(organizationId);
};

export const useCustomMetrics = (organizationId: string) => {
  const { useGetCustomMetrics, useCreateCustomMetric } = useAdvancedAnalytics();
  const { data: metrics, isLoading, error } = useGetCustomMetrics(organizationId);
  const createMetricMutation = useCreateCustomMetric();

  return {
    metrics,
    isLoading,
    error,
    createMetric: createMetricMutation.mutate,
    isCreating: createMetricMutation.isPending,
    createError: createMetricMutation.error,
  };
}; 