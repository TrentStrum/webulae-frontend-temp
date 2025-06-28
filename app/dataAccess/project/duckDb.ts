import type { Project } from '@/app/types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { db } from '@/app/lib/duckdb/serverConnection';

export class DuckDbProjectDataAccess implements DataAccessInterface<Project> {
	private table = 'projects';

	async getById(id: string): Promise<Project> {
		return new Promise((resolve, reject) => {
			const query = `
				SELECT id, name, description, status, user_id, organizationId, created_at, updated_at 
				FROM ${this.table} 
				WHERE id = ?
			`;
			db.all(query, [id], (err, rows) => {
				if (err) return reject(err);
				if (!rows.length) return reject(new Error('Project not found'));
				resolve(rows[0] as Project);
			});
		});
	}

	async getAll(): Promise<Project[]> {
		return new Promise((resolve, reject) => {
			const query = `
				SELECT id, name, description, status, user_id, organizationId, created_at, updated_at 
				FROM ${this.table}
				ORDER BY created_at DESC
			`;
			db.all(query, [], (err, rows) => {
				if (err) return reject(err);
				resolve(rows as Project[]);
			});
		});
	}

	async create(data: Partial<Project>): Promise<Project> {
		const id = `duck_${Date.now()}`;
		const now = new Date().toISOString();
		return new Promise((resolve, reject) => {
			const query = `
				INSERT INTO ${this.table} (id, name, description, status, user_id, organizationId, created_at, updated_at) 
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`;
			db.run(query, [
				id,
				data.name || '',
				data.description || '',
				data.status || 'pending',
				data.user_id || '',
				data.organizationId || null,
				now,
				now
			], (err) => {
				if (err) return reject(err);
				resolve({ ...data, id, created_at: now, updated_at: now } as Project);
			});
		});
	}

	async update(id: string, data: Partial<Project>): Promise<Project> {
		const now = new Date().toISOString();
		return new Promise((resolve, reject) => {
			// Build dynamic update query
			const updateFields: string[] = [];
			const updateValues: any[] = [];
			
			if (data.name !== undefined) {
				updateFields.push('name = ?');
				updateValues.push(data.name);
			}
			if (data.description !== undefined) {
				updateFields.push('description = ?');
				updateValues.push(data.description);
			}
			if (data.status !== undefined) {
				updateFields.push('status = ?');
				updateValues.push(data.status);
			}
			if (data.user_id !== undefined) {
				updateFields.push('user_id = ?');
				updateValues.push(data.user_id);
			}
			if (data.organizationId !== undefined) {
				updateFields.push('organizationId = ?');
				updateValues.push(data.organizationId);
			}
			
			updateFields.push('updated_at = ?');
			updateValues.push(now);
			updateValues.push(id);
			
			const query = `
				UPDATE ${this.table} 
				SET ${updateFields.join(', ')}
				WHERE id = ?
			`;
			
			db.run(query, updateValues, (err) => {
				if (err) return reject(err);
				this.getById(id).then(resolve).catch(reject);
			});
		});
	}

	async delete(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const query = `DELETE FROM ${this.table} WHERE id = ?`;
			db.run(query, [id], (err) => {
				if (err) return reject(err);
				resolve();
			});
		});
	}
}

export const projectDuckDBDataAccess = new DuckDbProjectDataAccess(); 
