import { DuckDB } from '@/app/lib/duckdb';
import { AirtableConfig, AirtableConnectionTest, DataAnalysisResponse } from '@/app/types/airtable.types';

export class AirtableDataAccess {
  private db: DuckDB;

  constructor() {
    this.db = new DuckDB();
  }

  /**
   * Initialize Airtable tables in DuckDB
   */
  async initialize(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS airtable_configs (
        id VARCHAR PRIMARY KEY,
        organization_id VARCHAR NOT NULL,
        api_key VARCHAR NOT NULL,
        base_id VARCHAR NOT NULL,
        base_name VARCHAR NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_sync_at TIMESTAMP
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS airtable_analysis_results (
        id VARCHAR PRIMARY KEY,
        organization_id VARCHAR NOT NULL,
        config_id VARCHAR NOT NULL,
        query VARCHAR NOT NULL,
        results JSON,
        insights JSON,
        visualizations JSON,
        execution_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (config_id) REFERENCES airtable_configs(id)
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS airtable_sync_logs (
        id VARCHAR PRIMARY KEY,
        config_id VARCHAR NOT NULL,
        sync_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sync_completed_at TIMESTAMP,
        records_synced INTEGER DEFAULT 0,
        tables_synced INTEGER DEFAULT 0,
        errors JSON,
        status VARCHAR DEFAULT 'in_progress',
        FOREIGN KEY (config_id) REFERENCES airtable_configs(id)
      )
    `);
  }

  /**
   * Create a new Airtable configuration
   */
  async createConfig(config: Omit<AirtableConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AirtableConfig> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db.execute(`
      INSERT INTO airtable_configs (
        id, organization_id, api_key, base_id, base_name, 
        is_active, created_at, updated_at, last_sync_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      config.organizationId,
      config.apiKey,
      config.baseId,
      config.baseName,
      config.isActive,
      now,
      now,
      config.lastSyncAt || null
    ]);

    return {
      ...config,
      id,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Get Airtable configuration by ID
   */
  async getConfigById(id: string): Promise<AirtableConfig | null> {
    const result = await this.db.query(`
      SELECT * FROM airtable_configs WHERE id = ?
    `, [id]);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      organizationId: row.organization_id,
      apiKey: row.api_key,
      baseId: row.base_id,
      baseName: row.base_name,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastSyncAt: row.last_sync_at
    };
  }

  /**
   * Get Airtable configurations by organization
   */
  async getConfigsByOrganization(organizationId: string): Promise<AirtableConfig[]> {
    const result = await this.db.query(`
      SELECT * FROM airtable_configs 
      WHERE organization_id = ? 
      ORDER BY created_at DESC
    `, [organizationId]);

    return result.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      apiKey: row.api_key,
      baseId: row.base_id,
      baseName: row.base_name,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastSyncAt: row.last_sync_at
    }));
  }

  /**
   * Update Airtable configuration
   */
  async updateConfig(id: string, updates: Partial<AirtableConfig>): Promise<AirtableConfig | null> {
    const current = await this.getConfigById(id);
    if (!current) {
      return null;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.apiKey !== undefined) {
      updateFields.push('api_key = ?');
      updateValues.push(updates.apiKey);
    }

    if (updates.baseId !== undefined) {
      updateFields.push('base_id = ?');
      updateValues.push(updates.baseId);
    }

    if (updates.baseName !== undefined) {
      updateFields.push('base_name = ?');
      updateValues.push(updates.baseName);
    }

    if (updates.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(updates.isActive);
    }

    if (updates.lastSyncAt !== undefined) {
      updateFields.push('last_sync_at = ?');
      updateValues.push(updates.lastSyncAt);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    await this.db.execute(`
      UPDATE airtable_configs 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    return this.getConfigById(id);
  }

  /**
   * Delete Airtable configuration
   */
  async deleteConfig(id: string): Promise<boolean> {
    const result = await this.db.execute(`
      DELETE FROM airtable_configs WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }

  /**
   * Store analysis results
   */
  async storeAnalysisResult(
    organizationId: string,
    configId: string,
    analysis: DataAnalysisResponse
  ): Promise<string> {
    const id = crypto.randomUUID();

    await this.db.execute(`
      INSERT INTO airtable_analysis_results (
        id, organization_id, config_id, query, results, 
        insights, visualizations, execution_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      organizationId,
      configId,
      analysis.query,
      JSON.stringify(analysis.results),
      JSON.stringify(analysis.insights),
      JSON.stringify(analysis.visualizations),
      analysis.executionTime,
      new Date().toISOString()
    ]);

    return id;
  }

  /**
   * Get analysis results by organization
   */
  async getAnalysisResults(organizationId: string, limit: number = 50): Promise<any[]> {
    const result = await this.db.query(`
      SELECT 
        ar.*,
        ac.base_name,
        ac.base_id
      FROM airtable_analysis_results ar
      JOIN airtable_configs ac ON ar.config_id = ac.id
      WHERE ar.organization_id = ?
      ORDER BY ar.created_at DESC
      LIMIT ?
    `, [organizationId, limit]);

    return result.map(row => ({
      id: row.id,
      query: row.query,
      results: JSON.parse(row.results),
      insights: JSON.parse(row.insights),
      visualizations: JSON.parse(row.visualizations),
      executionTime: row.execution_time,
      createdAt: row.created_at,
      baseName: row.base_name,
      baseId: row.base_id
    }));
  }

  /**
   * Create sync log entry
   */
  async createSyncLog(configId: string): Promise<string> {
    const id = crypto.randomUUID();

    await this.db.execute(`
      INSERT INTO airtable_sync_logs (
        id, config_id, sync_started_at, status
      ) VALUES (?, ?, ?, ?)
    `, [
      id,
      configId,
      new Date().toISOString(),
      'in_progress'
    ]);

    return id;
  }

  /**
   * Update sync log
   */
  async updateSyncLog(
    id: string,
    updates: {
      status: 'completed' | 'failed';
      recordsSynced?: number;
      tablesSynced?: number;
      errors?: string[];
    }
  ): Promise<void> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    updateFields.push('sync_completed_at = ?');
    updateValues.push(new Date().toISOString());

    updateFields.push('status = ?');
    updateValues.push(updates.status);

    if (updates.recordsSynced !== undefined) {
      updateFields.push('records_synced = ?');
      updateValues.push(updates.recordsSynced);
    }

    if (updates.tablesSynced !== undefined) {
      updateFields.push('tables_synced = ?');
      updateValues.push(updates.tablesSynced);
    }

    if (updates.errors !== undefined) {
      updateFields.push('errors = ?');
      updateValues.push(JSON.stringify(updates.errors));
    }

    updateValues.push(id);

    await this.db.execute(`
      UPDATE airtable_sync_logs 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);
  }

  /**
   * Get sync logs by configuration
   */
  async getSyncLogs(configId: string, limit: number = 20): Promise<any[]> {
    const result = await this.db.query(`
      SELECT * FROM airtable_sync_logs
      WHERE config_id = ?
      ORDER BY sync_started_at DESC
      LIMIT ?
    `, [configId, limit]);

    return result.map(row => ({
      id: row.id,
      syncStartedAt: row.sync_started_at,
      syncCompletedAt: row.sync_completed_at,
      recordsSynced: row.records_synced,
      tablesSynced: row.tables_synced,
      errors: row.errors ? JSON.parse(row.errors) : [],
      status: row.status
    }));
  }

  /**
   * Get analytics for Airtable usage
   */
  async getAnalytics(organizationId: string): Promise<any> {
    const configsResult = await this.db.query(`
      SELECT COUNT(*) as total_configs,
             COUNT(CASE WHEN is_active = true THEN 1 END) as active_configs
      FROM airtable_configs
      WHERE organization_id = ?
    `, [organizationId]);

    const analysisResult = await this.db.query(`
      SELECT COUNT(*) as total_analyses,
             AVG(execution_time) as avg_execution_time,
             MAX(created_at) as last_analysis
      FROM airtable_analysis_results
      WHERE organization_id = ?
    `, [organizationId]);

    const syncResult = await this.db.query(`
      SELECT COUNT(*) as total_syncs,
             COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_syncs,
             AVG(records_synced) as avg_records_synced
      FROM airtable_sync_logs sl
      JOIN airtable_configs ac ON sl.config_id = ac.id
      WHERE ac.organization_id = ?
    `, [organizationId]);

    return {
      configs: configsResult[0],
      analysis: analysisResult[0],
      syncs: syncResult[0]
    };
  }
} 