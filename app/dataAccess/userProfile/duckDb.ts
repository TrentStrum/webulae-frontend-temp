import type { UserProfile } from '@/app/types/user.types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { db } from '@/app/lib/duckdb/serverConnection';

export class DuckDbUserProfileDataAccess implements DataAccessInterface<UserProfile> {
	private table = 'user_profiles';

	async getById(id: string): Promise<UserProfile> {
		return new Promise((resolve, reject) => {
			db.all(`SELECT * FROM ${this.table} WHERE id = ?`, [id], (err, rows) => {
				if (err) return reject(err);
				if (!rows.length) return reject(new Error('User not found'));
				resolve(rows[0] as UserProfile);
			});
		});
	}

	async getAll(): Promise<UserProfile[]> {
		return new Promise((resolve, reject) => {
			db.all(`SELECT * FROM ${this.table}`, [], (err, rows) => {
				if (err) return reject(err);
				resolve(rows as UserProfile[]);
			});
		});
	}

	async create(data: Partial<UserProfile>): Promise<UserProfile> {
		const id = `duck_${Date.now()}`;
		const now = new Date().toISOString();
                return new Promise((resolve, reject) => {
                        db.run(
                                `INSERT INTO ${this.table} (id, name, email, organizationName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
                                [id, data.name ?? '', data.email ?? '', data.organizationName ?? '', now, now],
                                (err) => {
                                        if (err) return reject(err);
                                        resolve({ ...data, id, createdAt: now, updatedAt: now } as UserProfile);
                                }
                        );
                });
        }

        async update(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
                const now = new Date().toISOString();
                return new Promise((resolve, reject) => {
                        db.run(
                                `UPDATE ${this.table} SET name = ?, email = ?, organizationName = ?, updatedAt = ? WHERE id = ?`,
                                [data.name ?? '', data.email ?? '', data.organizationName ?? '', now, id],
                                (err) => {
                                        if (err) return reject(err);
                                        resolve({ ...data, id, updatedAt: now } as UserProfile);
                                }
                        );
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
}

export const userProfileDuckDBDataAccess = new DuckDbUserProfileDataAccess();
