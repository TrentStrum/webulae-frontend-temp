// Advanced Analytics Types
export interface AdvancedAnalytics {
  id: string;
  organizationId: string;
  type: AnalyticsType;
  data: AnalyticsData;
  insights: Insight[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  metadata: AnalyticsMetadata;
  createdAt: string;
  updatedAt: string;
}

export type AnalyticsType = 
  | 'user_behavior'
  | 'feature_adoption'
  | 'performance_optimization'
  | 'business_intelligence'
  | 'predictive_modeling'
  | 'anomaly_detection'
  | 'trend_analysis'
  | 'custom';

export interface AnalyticsData {
  timeSeries: TimeSeriesData[];
  aggregated: AggregatedData;
  segments: SegmentData[];
  correlations: CorrelationData[];
  distributions: DistributionData[];
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface AggregatedData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  featureUsage: Record<string, number>;
  performanceMetrics: PerformanceMetrics;
  businessMetrics: BusinessMetrics;
}

export interface SegmentData {
  segmentId: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  metrics: SegmentMetrics;
  size: number;
  percentage: number;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  conditions: 'AND' | 'OR';
}

export interface SegmentMetrics {
  averageSessionDuration: number;
  featureAdoptionRate: number;
  retentionRate: number;
  conversionRate: number;
  lifetimeValue: number;
}

export interface CorrelationData {
  variable1: string;
  variable2: string;
  correlation: number;
  significance: number;
  direction: 'positive' | 'negative' | 'none';
  strength: 'strong' | 'moderate' | 'weak';
}

export interface DistributionData {
  variable: string;
  bins: DistributionBin[];
  mean: number;
  median: number;
  standardDeviation: number;
  skewness: number;
}

export interface DistributionBin {
  range: string;
  count: number;
  percentage: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface BusinessMetrics {
  revenue: number;
  customerCount: number;
  churnRate: number;
  acquisitionCost: number;
  lifetimeValue: number;
  conversionRate: number;
}

// Insights
export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: InsightSeverity;
  confidence: number;
  data: InsightData;
  recommendations: string[];
  createdAt: string;
  expiresAt?: string;
}

export type InsightType = 
  | 'trend'
  | 'anomaly'
  | 'pattern'
  | 'correlation'
  | 'prediction'
  | 'optimization'
  | 'risk'
  | 'opportunity';

export type InsightSeverity = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info';

export interface InsightData {
  metric: string;
  currentValue: number;
  previousValue?: number;
  change: number;
  changePercentage: number;
  threshold?: number;
  context: Record<string, any>;
}

// Predictions
export interface Prediction {
  id: string;
  type: PredictionType;
  target: string;
  timeframe: PredictionTimeframe;
  value: number;
  confidence: number;
  range: PredictionRange;
  factors: PredictionFactor[];
  model: PredictionModel;
  createdAt: string;
  expiresAt: string;
}

export type PredictionType = 
  | 'user_growth'
  | 'revenue_forecast'
  | 'churn_prediction'
  | 'feature_adoption'
  | 'performance_degradation'
  | 'resource_usage'
  | 'demand_forecast'
  | 'custom';

export type PredictionTimeframe = 
  | '1_day'
  | '7_days'
  | '30_days'
  | '90_days'
  | '6_months'
  | '1_year';

export interface PredictionRange {
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
}

export interface PredictionFactor {
  variable: string;
  impact: number;
  direction: 'positive' | 'negative';
  confidence: number;
}

export interface PredictionModel {
  name: string;
  version: string;
  algorithm: string;
  accuracy: number;
  lastTrained: string;
  features: string[];
}

// Recommendations
export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  impact: RecommendationImpact;
  effort: RecommendationEffort;
  roi: number;
  actions: RecommendationAction[];
  dependencies: string[];
  createdAt: string;
  status: RecommendationStatus;
}

export type RecommendationType = 
  | 'feature_optimization'
  | 'user_experience'
  | 'performance_improvement'
  | 'business_growth'
  | 'cost_reduction'
  | 'risk_mitigation'
  | 'automation'
  | 'custom';

export type RecommendationPriority = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface RecommendationImpact {
  metric: string;
  expectedImprovement: number;
  confidence: number;
  timeframe: string;
}

export interface RecommendationEffort {
  level: 'low' | 'medium' | 'high';
  estimatedHours: number;
  resources: string[];
  complexity: string;
}

export interface RecommendationAction {
  id: string;
  title: string;
  description: string;
  type: 'automated' | 'manual' | 'configuration';
  steps: string[];
  estimatedDuration: string;
  assignee?: string;
}

export type RecommendationStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'deferred';

// Analytics Metadata
export interface AnalyticsMetadata {
  version: string;
  dataSource: string;
  lastUpdated: string;
  refreshInterval: number;
  dataQuality: DataQuality;
  processingTime: number;
  modelVersion: string;
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  overall: number;
}

// AI Models and Algorithms
export interface AIModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  algorithm: string;
  hyperparameters: Record<string, any>;
  performance: ModelPerformance;
  trainingData: TrainingData;
  deployment: DeploymentInfo;
  createdAt: string;
  updatedAt: string;
}

export type ModelType = 
  | 'regression'
  | 'classification'
  | 'clustering'
  | 'time_series'
  | 'anomaly_detection'
  | 'recommendation'
  | 'nlp'
  | 'custom';

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  mse: number;
  mae: number;
}

export interface TrainingData {
  size: number;
  features: string[];
  target: string;
  split: {
    training: number;
    validation: number;
    test: number;
  };
  lastUpdated: string;
}

export interface DeploymentInfo {
  status: 'training' | 'deployed' | 'failed' | 'archived';
  endpoint?: string;
  version: string;
  deployedAt?: string;
  performance: {
    latency: number;
    throughput: number;
    errorRate: number;
  };
}

// Anomaly Detection
export interface Anomaly {
  id: string;
  type: AnomalyType;
  metric: string;
  timestamp: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AnomalySeverity;
  context: AnomalyContext;
  status: AnomalyStatus;
  createdAt: string;
  resolvedAt?: string;
}

export type AnomalyType = 
  | 'spike'
  | 'drop'
  | 'trend_change'
  | 'seasonal_violation'
  | 'outlier'
  | 'pattern_violation';

export type AnomalySeverity = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface AnomalyContext {
  relatedMetrics: string[];
  userSegments: string[];
  timeWindow: string;
  environmentalFactors: Record<string, any>;
  rootCause?: string;
}

export type AnomalyStatus = 
  | 'detected'
  | 'investigating'
  | 'resolved'
  | 'false_positive'
  | 'ignored';

// Trend Analysis
export interface Trend {
  id: string;
  metric: string;
  direction: TrendDirection;
  strength: TrendStrength;
  duration: string;
  seasonality: SeasonalityInfo;
  forecast: TrendForecast;
  confidence: number;
  createdAt: string;
}

export type TrendDirection = 
  | 'increasing'
  | 'decreasing'
  | 'stable'
  | 'cyclical';

export type TrendStrength = 
  | 'strong'
  | 'moderate'
  | 'weak';

export interface SeasonalityInfo {
  hasSeasonality: boolean;
  period?: string;
  strength?: number;
  pattern?: string;
}

export interface TrendForecast {
  nextValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  timeframe: string;
  factors: string[];
}

// API Response Types
export interface AdvancedAnalyticsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    executionTime: number;
    modelVersion: string;
  };
}

export interface AnalyticsInsightResponse {
  insights: Insight[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  anomalies: Anomaly[];
  trends: Trend[];
  summary: {
    totalInsights: number;
    criticalInsights: number;
    actionableRecommendations: number;
    predictedValue: number;
  };
}

export interface ModelTrainingResponse {
  modelId: string;
  status: 'training' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion?: string;
  performance?: ModelPerformance;
  message?: string;
}

// Configuration Types
export interface AnalyticsConfig {
  id: string;
  organizationId: string;
  enabledFeatures: AnalyticsFeature[];
  dataRetention: DataRetentionConfig;
  alerting: AlertingConfig;
  models: ModelConfig[];
  customMetrics: CustomMetric[];
  createdAt: string;
  updatedAt: string;
}

export type AnalyticsFeature = 
  | 'predictive_insights'
  | 'anomaly_detection'
  | 'trend_analysis'
  | 'user_segmentation'
  | 'recommendation_engine'
  | 'performance_optimization'
  | 'business_intelligence'
  | 'custom_models';

export interface DataRetentionConfig {
  rawData: number; // days
  aggregatedData: number; // days
  insights: number; // days
  models: number; // days
}

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  schedule: AlertSchedule;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AlertThreshold {
  metric: string;
  condition: 'above' | 'below' | 'equals';
  value: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface AlertSchedule {
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  timezone: string;
  quietHours?: {
    start: string;
    end: string;
  };
}

export interface ModelConfig {
  modelId: string;
  enabled: boolean;
  parameters: Record<string, any>;
  schedule: string;
  alerts: boolean;
}

export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  dataSource: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  timeWindow: string;
  enabled: boolean;
} 