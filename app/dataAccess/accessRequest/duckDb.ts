import type { AccessRequestDataAccessInterface } from '@/app/contracts/DataAccess';
import type { AccessRequest, AccessRequestListParams } from '@/app/types/accessRequest.types';
import { db } from '@/app/lib/duckdb/serverConnection';

export class DuckDbAccessRequestDataAccess implements AccessRequestDataAccessInterface<AccessRequest> {
  private table = 'access_requests';

  async getById(id: string): Promise<AccessRequest> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          firstName,
          lastName,
          email,
          companyName,
          jobTitle,
          useCase,
          teamSize,
          industry,
          expectedStartDate,
          additionalInfo,
          status,
          submittedAt,
          reviewedAt,
          reviewedBy,
          adminNotes
        FROM ${this.table} 
        WHERE id = ?
      `, [id], (err, rows) => {
        if (err) return reject(err);
        if (!rows.length) return reject(new Error(`Access request with id ${id} not found`));
        resolve(rows[0] as AccessRequest);
      });
    });
  }

  async getAll(): Promise<AccessRequest[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          firstName,
          lastName,
          email,
          companyName,
          jobTitle,
          useCase,
          teamSize,
          industry,
          expectedStartDate,
          additionalInfo,
          status,
          submittedAt,
          reviewedAt,
          reviewedBy,
          adminNotes
        FROM ${this.table} 
        ORDER BY submittedAt DESC
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows as AccessRequest[]);
      });
    });
  }

  async create(data: Partial<AccessRequest>): Promise<AccessRequest> {
    const id = crypto.randomUUID();
    const submittedAt = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO ${this.table} (
          id,
          firstName,
          lastName,
          email,
          companyName,
          jobTitle,
          useCase,
          teamSize,
          industry,
          expectedStartDate,
          additionalInfo,
          status,
          submittedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        data.firstName || '',
        data.lastName || '',
        data.email || '',
        data.companyName || '',
        data.jobTitle || '',
        data.useCase || '',
        data.teamSize || '1-5',
        data.industry || '',
        data.expectedStartDate || '',
        data.additionalInfo || null,
        data.status || 'pending',
        submittedAt
      ], (err) => {
        if (err) return reject(err);
        resolve({ ...data, id, submittedAt } as AccessRequest);
      });
    });
  }

  async update(id: string, data: Partial<AccessRequest>): Promise<AccessRequest> {
    return new Promise((resolve, reject) => {
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (data.firstName !== undefined) {
        updateFields.push('firstName = ?');
        updateValues.push(data.firstName);
      }
      if (data.lastName !== undefined) {
        updateFields.push('lastName = ?');
        updateValues.push(data.lastName);
      }
      if (data.email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(data.email);
      }
      if (data.companyName !== undefined) {
        updateFields.push('companyName = ?');
        updateValues.push(data.companyName);
      }
      if (data.jobTitle !== undefined) {
        updateFields.push('jobTitle = ?');
        updateValues.push(data.jobTitle);
      }
      if (data.useCase !== undefined) {
        updateFields.push('useCase = ?');
        updateValues.push(data.useCase);
      }
      if (data.teamSize !== undefined) {
        updateFields.push('teamSize = ?');
        updateValues.push(data.teamSize);
      }
      if (data.industry !== undefined) {
        updateFields.push('industry = ?');
        updateValues.push(data.industry);
      }
      if (data.expectedStartDate !== undefined) {
        updateFields.push('expectedStartDate = ?');
        updateValues.push(data.expectedStartDate);
      }
      if (data.additionalInfo !== undefined) {
        updateFields.push('additionalInfo = ?');
        updateValues.push(data.additionalInfo);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }
      if (data.reviewedAt !== undefined) {
        updateFields.push('reviewedAt = ?');
        updateValues.push(data.reviewedAt);
      }
      if (data.reviewedBy !== undefined) {
        updateFields.push('reviewedBy = ?');
        updateValues.push(data.reviewedBy);
      }
      if (data.adminNotes !== undefined) {
        updateFields.push('adminNotes = ?');
        updateValues.push(data.adminNotes);
      }

      if (updateFields.length === 0) {
        return this.getById(id).then(resolve).catch(reject);
      }

      updateValues.push(id);
      
      db.run(`
        UPDATE ${this.table} 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues, (err) => {
        if (err) return reject(err);
        this.getById(id).then(resolve).catch(reject);
      });
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM ${this.table} WHERE id = ?`, [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  // Custom methods for access requests
  async list(params?: AccessRequestListParams): Promise<AccessRequest[]> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          id,
          firstName,
          lastName,
          email,
          companyName,
          jobTitle,
          useCase,
          teamSize,
          industry,
          expectedStartDate,
          additionalInfo,
          status,
          submittedAt,
          reviewedAt,
          reviewedBy,
          adminNotes
        FROM ${this.table}
      `;
      
      const queryParams: any[] = [];
      const conditions: string[] = [];
      
      if (params?.status) {
        conditions.push('status = ?');
        queryParams.push(params.status);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ' ORDER BY submittedAt DESC';
      
      if (params?.limit) {
        query += ' LIMIT ?';
        queryParams.push(params.limit);
      }
      
      if (params?.offset) {
        query += ' OFFSET ?';
        queryParams.push(params.offset);
      }
      
      db.all(query, queryParams, (err, rows) => {
        if (err) return reject(err);
        resolve(rows as AccessRequest[]);
      });
    });
  }

  async approve(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return this.update(id, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  }

  async reject(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return this.update(id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  }
}

export const accessRequestDuckDBDataAccess = new DuckDbAccessRequestDataAccess(); 