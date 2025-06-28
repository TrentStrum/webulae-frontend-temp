// AI Model Fine-tuning Types
export interface FineTuningJob {
  id: string;
  organizationId: string;
  modelId: string;
  status: FineTuningStatus;
  trainingData: TrainingData;
  configuration: FineTuningConfig;
  progress: FineTuningProgress;
  results: FineTuningResults;
  metadata: FineTuningMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type FineTuningStatus = 
  | 'pending'
  | 'preparing'
  | 'training'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TrainingData {
  id: string;
  name: string;
  description: string;
  source: DataSource;
  format: DataFormat;
  size: number;
  records: number;
  features: string[];
  target: string;
  split: DataSplit;
  quality: DataQuality;
  createdAt: string;
  updatedAt: string;
}

export type DataSource = 
  | 'upload'
  | 'database'
  | 'api'
  | 'integration'
  | 'synthetic'
  | 'external';

export type DataFormat = 
  | 'csv'
  | 'json'
  | 'parquet'
  | 'excel'
  | 'database'
  | 'api_response';

export interface DataSplit {
  training: number; // percentage
  validation: number; // percentage
  test: number; // percentage
  totalRecords: number;
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  overall: number;
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  type: 'missing_values' | 'duplicates' | 'outliers' | 'inconsistency' | 'format_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRecords: number;
  percentage: number;
}

export interface FineTuningConfig {
  baseModel: string;
  modelType: ModelType;
  hyperparameters: Hyperparameters;
  architecture: ModelArchitecture;
  optimization: OptimizationConfig;
  regularization: RegularizationConfig;
  earlyStopping: EarlyStoppingConfig;
  validation: ValidationConfig;
}

export type ModelType = 
  | 'classification'
  | 'regression'
  | 'time_series'
  | 'nlp'
  | 'computer_vision'
  | 'recommendation'
  | 'anomaly_detection'
  | 'custom';

export interface Hyperparameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: OptimizerType;
  lossFunction: string;
  metrics: string[];
  customParams?: Record<string, any>;
}

export type OptimizerType = 
  | 'adam'
  | 'sgd'
  | 'rmsprop'
  | 'adamw'
  | 'adafactor'
  | 'custom';

export interface ModelArchitecture {
  layers: LayerConfig[];
  activationFunctions: string[];
  dropoutRate: number;
  batchNormalization: boolean;
  residualConnections: boolean;
  attentionMechanism?: AttentionConfig;
}

export interface LayerConfig {
  type: 'dense' | 'conv1d' | 'conv2d' | 'lstm' | 'gru' | 'transformer' | 'custom';
  units: number;
  activation: string;
  dropout?: number;
  batchNorm?: boolean;
  parameters?: Record<string, any>;
}

export interface AttentionConfig {
  type: 'self_attention' | 'multi_head' | 'cross_attention';
  heads: number;
  keyDim: number;
  valueDim: number;
  dropout: number;
}

export interface OptimizationConfig {
  algorithm: 'gradient_descent' | 'genetic' | 'bayesian' | 'grid_search' | 'random_search';
  searchSpace: SearchSpace;
  maxTrials: number;
  objective: OptimizationObjective;
  constraints: OptimizationConstraint[];
}

export interface SearchSpace {
  learningRate: { min: number; max: number; step?: number };
  batchSize: number[];
  epochs: { min: number; max: number };
  layers: { min: number; max: number };
  units: { min: number; max: number };
  dropout: { min: number; max: number };
}

export interface OptimizationObjective {
  metric: string;
  direction: 'minimize' | 'maximize';
  weight: number;
}

export interface OptimizationConstraint {
  type: 'resource' | 'performance' | 'quality';
  metric: string;
  operator: 'less_than' | 'greater_than' | 'equals';
  value: number;
}

export interface RegularizationConfig {
  l1Regularization: number;
  l2Regularization: number;
  dropoutRate: number;
  dataAugmentation: DataAugmentationConfig;
}

export interface DataAugmentationConfig {
  enabled: boolean;
  techniques: AugmentationTechnique[];
  probability: number;
}

export type AugmentationTechnique = 
  | 'noise_injection'
  | 'feature_scaling'
  | 'synthetic_sampling'
  | 'cross_validation'
  | 'ensemble_methods';

export interface EarlyStoppingConfig {
  enabled: boolean;
  patience: number;
  minDelta: number;
  monitor: string;
  mode: 'min' | 'max';
  restoreBestWeights: boolean;
}

export interface ValidationConfig {
  method: 'holdout' | 'cross_validation' | 'bootstrap' | 'time_series_split';
  folds: number;
  metrics: ValidationMetric[];
  thresholds: ValidationThreshold[];
}

export interface ValidationMetric {
  name: string;
  weight: number;
  target: number;
  tolerance: number;
}

export interface ValidationThreshold {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals';
  value: number;
  severity: 'warning' | 'error' | 'critical';
}

export interface FineTuningProgress {
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  percentage: number;
  estimatedTimeRemaining: number;
  currentMetrics: TrainingMetrics;
  bestMetrics: TrainingMetrics;
  learningRate: number;
  loss: number;
  validationLoss: number;
  status: string;
  lastUpdate: string;
}

export interface TrainingMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  mse: number;
  mae: number;
  customMetrics: Record<string, number>;
}

export interface FineTuningResults {
  modelId: string;
  modelVersion: string;
  performance: ModelPerformance;
  comparison: ModelComparison;
  deployment: DeploymentInfo;
  artifacts: ModelArtifacts;
  insights: FineTuningInsights;
}

export interface ModelPerformance {
  trainingMetrics: TrainingMetrics;
  validationMetrics: TrainingMetrics;
  testMetrics: TrainingMetrics;
  crossValidationScores: CrossValidationScores;
  confusionMatrix?: ConfusionMatrix;
  rocCurve?: ROCCurve;
  featureImportance?: FeatureImportance[];
}

export interface CrossValidationScores {
  mean: number;
  std: number;
  min: number;
  max: number;
  scores: number[];
}

export interface ConfusionMatrix {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  matrix: number[][];
  labels: string[];
}

export interface ROCCurve {
  fpr: number[];
  tpr: number[];
  thresholds: number[];
  auc: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  type: 'permutation' | 'shap' | 'coefficient' | 'tree';
}

export interface ModelComparison {
  baselineModel: string;
  improvements: ModelImprovement[];
  statisticalSignificance: StatisticalTest;
  businessImpact: BusinessImpact;
}

export interface ModelImprovement {
  metric: string;
  baselineValue: number;
  newValue: number;
  improvement: number;
  percentage: number;
  significance: 'low' | 'medium' | 'high';
}

export interface StatisticalTest {
  test: 't_test' | 'wilcoxon' | 'mann_whitney' | 'chi_square';
  pValue: number;
  significant: boolean;
  confidenceLevel: number;
}

export interface BusinessImpact {
  costSavings: number;
  revenueIncrease: number;
  efficiencyGain: number;
  riskReduction: number;
  roi: number;
  paybackPeriod: number;
}

export interface DeploymentInfo {
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled_back';
  endpoint: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  performance: DeploymentPerformance;
  monitoring: MonitoringConfig;
}

export interface DeploymentPerformance {
  latency: number;
  throughput: number;
  errorRate: number;
  availability: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  gpu: number;
  storage: number;
  network: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
}

export interface AlertConfig {
  metric: string;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warning' | 'error';
  format: 'json' | 'text';
  retention: number;
  destination: 'file' | 'database' | 'cloud';
}

export interface ModelArtifacts {
  modelFile: string;
  weightsFile: string;
  configFile: string;
  vocabularyFile?: string;
  metadataFile: string;
  size: number;
  checksum: string;
  compression: boolean;
}

export interface FineTuningInsights {
  dataInsights: DataInsight[];
  modelInsights: ModelInsight[];
  performanceInsights: PerformanceInsight[];
  recommendations: FineTuningRecommendation[];
}

export interface DataInsight {
  type: 'quality' | 'distribution' | 'correlation' | 'bias' | 'drift';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  recommendations: string[];
}

export interface ModelInsight {
  type: 'architecture' | 'hyperparameters' | 'training' | 'convergence';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  recommendations: string[];
}

export interface PerformanceInsight {
  type: 'overfitting' | 'underfitting' | 'bias' | 'variance' | 'generalization';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  recommendations: string[];
}

export interface FineTuningRecommendation {
  type: 'data' | 'model' | 'training' | 'deployment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  actions: string[];
}

export interface FineTuningMetadata {
  version: string;
  framework: string;
  hardware: HardwareConfig;
  environment: EnvironmentConfig;
  cost: CostInfo;
  compliance: ComplianceInfo;
}

export interface HardwareConfig {
  cpu: string;
  memory: string;
  gpu?: string;
  storage: string;
  network: string;
}

export interface EnvironmentConfig {
  os: string;
  python: string;
  dependencies: string[];
  container: string;
  cloud: string;
}

export interface CostInfo {
  computeCost: number;
  storageCost: number;
  networkCost: number;
  totalCost: number;
  currency: string;
  billingPeriod: string;
}

export interface ComplianceInfo {
  dataPrivacy: string[];
  security: string[];
  audit: string[];
  certifications: string[];
}

// API Response Types
export interface FineTuningResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    executionTime: number;
    version: string;
  };
}

export interface FineTuningJobResponse {
  job: FineTuningJob;
  status: FineTuningStatus;
  progress: FineTuningProgress;
  estimatedCompletion?: string;
}

export interface ModelDeploymentResponse {
  modelId: string;
  status: 'deploying' | 'deployed' | 'failed';
  endpoint?: string;
  version: string;
  performance: DeploymentPerformance;
}

// Configuration Types
export interface FineTuningTemplate {
  id: string;
  name: string;
  description: string;
  modelType: ModelType;
  industry: string;
  useCase: string;
  configuration: FineTuningConfig;
  expectedPerformance: TrainingMetrics;
  requirements: TemplateRequirements;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRequirements {
  minDataSize: number;
  minFeatures: number;
  dataQuality: number;
  computeResources: string[];
  estimatedTime: number;
  estimatedCost: number;
}

// Training Data Management
export interface DataPreparationJob {
  id: string;
  organizationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dataSource: DataSource;
  transformations: DataTransformation[];
  validation: DataValidation;
  output: PreparedData;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface DataTransformation {
  type: 'cleaning' | 'feature_engineering' | 'scaling' | 'encoding' | 'sampling';
  parameters: Record<string, any>;
  applied: boolean;
  result: TransformationResult;
}

export interface TransformationResult {
  success: boolean;
  recordsProcessed: number;
  recordsModified: number;
  errors: string[];
  warnings: string[];
}

export interface DataValidation {
  schema: DataSchema;
  rules: ValidationRule[];
  results: ValidationResult;
}

export interface DataSchema {
  fields: SchemaField[];
  constraints: SchemaConstraint[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  nullable: boolean;
  constraints: FieldConstraint[];
}

export interface FieldConstraint {
  type: 'min' | 'max' | 'pattern' | 'enum' | 'format';
  value: any;
  message: string;
}

export interface SchemaConstraint {
  type: 'unique' | 'foreign_key' | 'check' | 'custom';
  fields: string[];
  condition: string;
  message: string;
}

export interface ValidationRule {
  name: string;
  description: string;
  condition: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}

export interface ValidationError {
  rule: string;
  message: string;
  affectedRecords: number;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  rule: string;
  message: string;
  affectedRecords: number;
  suggestion: string;
}

export interface ValidationSummary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errorCount: number;
  warningCount: number;
  qualityScore: number;
}

export interface PreparedData {
  id: string;
  name: string;
  format: DataFormat;
  size: number;
  records: number;
  features: string[];
  target: string;
  split: DataSplit;
  quality: DataQuality;
  location: string;
  checksum: string;
  createdAt: string;
} 