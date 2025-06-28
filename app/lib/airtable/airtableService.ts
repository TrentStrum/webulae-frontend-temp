import { 
  AirtableConfig, 
  AirtableBase, 
  AirtableTable, 
  AirtableRecord, 
  AirtableConnectionTest,
  DataAnalysisRequest,
  DataAnalysisResponse,
  DatabaseDesignRequest,
  DatabaseDesignResponse
} from '@/app/types/airtable.types';

export class AirtableService {
  private apiKey: string;
  private baseId?: string;

  constructor(apiKey: string, baseId?: string) {
    this.apiKey = apiKey;
    this.baseId = baseId;
  }

  /**
   * Test Airtable connection and get base information
   */
  async testConnection(): Promise<AirtableConnectionTest> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.bases && data.bases.length > 0) {
        const base = data.bases[0]; // Get first base for testing
        return {
          isValid: true,
          baseName: base.name,
          tableCount: base.tableCount || 0
        };
      }

      return {
        isValid: false,
        error: 'No bases found in Airtable account'
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all bases for the authenticated user
   */
  async getBases(): Promise<AirtableBase[]> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.bases || [];
    } catch (error) {
      console.error('Error fetching Airtable bases:', error);
      throw error;
    }
  }

  /**
   * Get base schema including tables and fields
   */
  async getBaseSchema(baseId: string): Promise<AirtableBase> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Get base info
      const baseResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const baseData = await baseResponse.json();

      return {
        id: baseId,
        name: baseData.name || 'Unknown Base',
        description: baseData.description,
        tables: data.tables || []
      };
    } catch (error) {
      console.error('Error fetching base schema:', error);
      throw error;
    }
  }

  /**
   * Get records from a specific table
   */
  async getRecords(baseId: string, tableId: string, options: {
    maxRecords?: number;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    fields?: string[];
  } = {}): Promise<AirtableRecord[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.maxRecords) {
        params.append('maxRecords', options.maxRecords.toString());
      }
      
      if (options.filterByFormula) {
        params.append('filterByFormula', options.filterByFormula);
      }
      
      if (options.sort) {
        params.append('sort[0][field]', options.sort[0].field);
        params.append('sort[0][direction]', options.sort[0].direction);
      }
      
      if (options.fields) {
        options.fields.forEach(field => {
          params.append('fields[]', field);
        });
      }

      const url = `https://api.airtable.com/v0/${baseId}/${tableId}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching Airtable records:', error);
      throw error;
    }
  }

  /**
   * Create a new record in Airtable
   */
  async createRecord(baseId: string, tableId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{ fields }]
        })
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records[0];
    } catch (error) {
      console.error('Error creating Airtable record:', error);
      throw error;
    }
  }

  /**
   * Update an existing record in Airtable
   */
  async updateRecord(baseId: string, tableId: string, recordId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{ id: recordId, fields }]
        })
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records[0];
    } catch (error) {
      console.error('Error updating Airtable record:', error);
      throw error;
    }
  }

  /**
   * Delete a record from Airtable
   */
  async deleteRecord(baseId: string, tableId: string, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}?records[]=${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting Airtable record:', error);
      throw error;
    }
  }

  /**
   * Analyze data using AI
   */
  async analyzeData(request: DataAnalysisRequest): Promise<DataAnalysisResponse> {
    try {
      // This would integrate with your AI service
      // For now, we'll create a mock response
      const startTime = Date.now();
      
      // Get the data from Airtable
      const records = await this.getRecords(request.tableId, request.tableId, {
        maxRecords: request.limit || 1000
      });

      // Process the data and generate insights
      const results = this.generateAnalysisResults(records, request.query);
      const insights = this.generateInsights(records);
      const visualizations = this.generateVisualizations(records, request.query);

      return {
        query: request.query,
        results,
        insights,
        visualizations,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Error analyzing data:', error);
      throw error;
    }
  }

  /**
   * Generate database design suggestions using AI
   */
  async generateDatabaseDesign(request: DatabaseDesignRequest): Promise<DatabaseDesignResponse> {
    try {
      // This would integrate with your AI service
      // For now, we'll create a mock response based on common patterns
      const tables = this.generateSuggestedTables(request);
      const relationships = this.generateTableRelationships(tables);
      const recommendations = this.generateRecommendations(request);
      const implementationSteps = this.generateImplementationSteps(tables);

      return {
        tables,
        relationships,
        recommendations,
        implementationSteps
      };
    } catch (error) {
      console.error('Error generating database design:', error);
      throw error;
    }
  }

  // Helper methods for data analysis
  private generateAnalysisResults(records: AirtableRecord[], query: string): any[] {
    // Mock implementation - would use AI to analyze data
    return [
      {
        type: 'summary',
        title: 'Data Summary',
        description: `Analyzed ${records.length} records`,
        data: records.slice(0, 5),
        confidence: 0.9
      }
    ];
  }

  private generateInsights(records: AirtableRecord[]): any[] {
    // Mock implementation - would use AI to generate insights
    return [
      {
        type: 'pattern',
        title: 'Data Pattern Detected',
        description: 'Found consistent patterns in the data',
        impact: 'medium',
        actionable: true,
        actionItems: ['Review data quality', 'Consider data validation']
      }
    ];
  }

  private generateVisualizations(records: AirtableRecord[], query: string): any[] {
    // Mock implementation - would generate charts based on data
    return [
      {
        type: 'chart',
        title: 'Data Overview',
        data: records.slice(0, 10),
        config: {
          chartType: 'bar',
          xAxis: 'id',
          yAxis: 'count'
        }
      }
    ];
  }

  private generateSuggestedTables(request: DatabaseDesignRequest): any[] {
    // Mock implementation - would use AI to suggest tables
    return [
      {
        name: 'Customers',
        description: 'Customer information and contact details',
        fields: [
          { name: 'Name', type: 'singleLineText', isRequired: true },
          { name: 'Email', type: 'email', isRequired: true },
          { name: 'Phone', type: 'phoneNumber' },
          { name: 'Status', type: 'singleSelect', options: { choices: ['Active', 'Inactive', 'Prospect'] } }
        ],
        estimatedRecords: 1000,
        updateFrequency: 'daily'
      }
    ];
  }

  private generateTableRelationships(tables: any[]): any[] {
    // Mock implementation - would generate relationships
    return [];
  }

  private generateRecommendations(request: DatabaseDesignRequest): string[] {
    // Mock implementation - would use AI to generate recommendations
    return [
      'Consider implementing data validation rules',
      'Set up automated backups for your data',
      'Create views for different user roles'
    ];
  }

  private generateImplementationSteps(tables: any[]): string[] {
    // Mock implementation - would generate step-by-step instructions
    return [
      'Create the base tables in Airtable',
      'Set up field validations and formulas',
      'Import existing data if available',
      'Test the database with sample queries'
    ];
  }
} 