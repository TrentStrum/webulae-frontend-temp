// Airtable Configuration Types
export interface AirtableConfig {
  id: string;
  organizationId: string;
  apiKey: string;
  baseId: string;
  baseName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
}

// Airtable Base and Table Types
export interface AirtableBase {
  id: string;
  name: string;
  description?: string;
  tables: AirtableTable[];
}

export interface AirtableTable {
  id: string;
  name: string;
  description?: string;
  fields: AirtableField[];
  recordCount: number;
  isActive: boolean;
}

export interface AirtableField {
  id: string;
  name: string;
  type: AirtableFieldType;
  description?: string;
  options?: AirtableFieldOptions;
  isRequired: boolean;
  isUnique: boolean;
}

export type AirtableFieldType = 
  | 'singleLineText'
  | 'longText'
  | 'number'
  | 'singleSelect'
  | 'multipleSelects'
  | 'date'
  | 'dateTime'
  | 'phoneNumber'
  | 'email'
  | 'url'
  | 'checkbox'
  | 'currency'
  | 'percent'
  | 'duration'
  | 'rating'
  | 'formula'
  | 'rollup'
  | 'lookup'
  | 'multipleRecordLinks'
  | 'singleRecordLink'
  | 'multipleAttachments'
  | 'barcode'
  | 'button'
  | 'createdTime'
  | 'lastModifiedTime'
  | 'autoNumber'
  | 'aiText'
  | 'aiImage';

export interface AirtableFieldOptions {
  // For single/multiple select fields
  choices?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  
  // For number fields
  precision?: number;
  negative?: boolean;
  
  // For currency fields
  symbol?: string;
  
  // For formula fields
  formula?: string;
  
  // For lookup/rollup fields
  linkedTableId?: string;
  linkedFieldId?: string;
  
  // For date fields
  dateFormat?: string;
  timeFormat?: string;
}

// Airtable Record Types
export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
  commentCount?: number;
}

export interface AirtableRecordCollection {
  records: AirtableRecord[];
  offset?: string;
}

// Data Analysis Types
export interface DataAnalysisRequest {
  query: string;
  tableId: string;
  filters?: DataFilter[];
  limit?: number;
  sortBy?: DataSort[];
}

export interface DataAnalysisResponse {
  query: string;
  results: DataAnalysisResult[];
  insights: DataInsight[];
  visualizations: DataVisualization[];
  executionTime: number;
}

export interface DataAnalysisResult {
  type: 'summary' | 'trend' | 'comparison' | 'anomaly' | 'prediction';
  title: string;
  description: string;
  data: any[];
  confidence: number;
}

export interface DataInsight {
  type: 'pattern' | 'trend' | 'anomaly' | 'correlation' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionItems?: string[];
}

export interface DataVisualization {
  type: 'chart' | 'table' | 'metric' | 'heatmap';
  title: string;
  data: any[];
  config: ChartConfig;
}

export interface ChartConfig {
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table';
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
  sizeBy?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface DataSort {
  field: string;
  direction: 'asc' | 'desc';
}

// Setup Wizard Types
export interface SetupWizardStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isCompleted: boolean;
  isRequired: boolean;
  validation?: (data: any) => boolean;
}

export interface SetupWizardState {
  currentStep: number;
  steps: SetupWizardStep[];
  data: SetupWizardData;
  isComplete: boolean;
}

export interface SetupWizardData {
  apiKey?: string;
  selectedBase?: AirtableBase;
  tableMappings?: TableMapping[];
  fieldMappings?: FieldMapping[];
  analysisPreferences?: AnalysisPreferences;
}

export interface TableMapping {
  airtableTableId: string;
  airtableTableName: string;
  businessEntity: string;
  description: string;
  isPrimary: boolean;
}

export interface FieldMapping {
  airtableFieldId: string;
  airtableFieldName: string;
  businessField: string;
  dataType: string;
  isKey: boolean;
  isRequired: boolean;
}

export interface AnalysisPreferences {
  defaultChartType: 'bar' | 'line' | 'pie' | 'scatter';
  enablePredictions: boolean;
  enableAnomalyDetection: boolean;
  refreshInterval: number; // minutes
  maxRecordsPerQuery: number;
}

// AI Assistant Types
export interface DatabaseDesignRequest {
  businessDescription: string;
  goals: string[];
  currentProcesses: string[];
  dataSources: string[];
  teamSize: number;
  industry: string;
}

export interface DatabaseDesignResponse {
  tables: SuggestedTable[];
  relationships: TableRelationship[];
  recommendations: string[];
  implementationSteps: string[];
}

export interface SuggestedTable {
  name: string;
  description: string;
  fields: SuggestedField[];
  estimatedRecords: number;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface SuggestedField {
  name: string;
  type: AirtableFieldType;
  description: string;
  isRequired: boolean;
  isUnique: boolean;
  options?: AirtableFieldOptions;
}

export interface TableRelationship {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
}

// API Response Types
export interface AirtableApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AirtableConnectionTest {
  isValid: boolean;
  baseName?: string;
  tableCount?: number;
  error?: string;
}

export interface AirtableSyncStatus {
  lastSyncAt: string;
  recordsSynced: number;
  tablesSynced: number;
  errors: string[];
  isInProgress: boolean;
} 