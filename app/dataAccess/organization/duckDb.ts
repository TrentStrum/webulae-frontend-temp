import type {
	Organization,
	OrganizationMember,
	OrganizationInvite,
} from '@/app/types/organization.types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { db } from '@/app/lib/duckdb/serverConnection';
import { DataAccessError, NotFoundError } from '@/app/lib/dataAccess';
import { randomUUID } from 'crypto';

export class DuckDbBusinessDataAccess implements DataAccessInterface<Organization> {
	private table = 'organizations';

	async getById(id: string): Promise<Organization> {
		return new Promise((resolve, reject) => {
			db.all(`SELECT * FROM ${this.table} WHERE id = ?`, [id], (err, rows) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				if (!rows.length) return reject(new NotFoundError('Organization', id));
				resolve(rows[0] as Organization);
			});
		});
	}

	async getAll(): Promise<Organization[]> {
		return new Promise((resolve, reject) => {
			db.all(`SELECT * FROM ${this.table} ORDER BY name ASC`, [], (err, rows) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				resolve(rows as Organization[]);
			});
		});
	}

	async create(data: Partial<Organization>): Promise<Organization> {
		const id = `bus_${randomUUID()}`;
		const now = new Date().toISOString();
		return new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO ${this.table} (id, name, description, imageUrl, website, industry, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					id,
					data.name ?? '',
					data.description ?? '',
					data.imageUrl ?? '',
					data.website ?? '',
					data.industry ?? '',
					now,
					now,
				],
				(err) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					resolve({ ...data, id, createdAt: now, updatedAt: now } as Organization);
				},
			);
		});
	}

	async update(id: string, data: Partial<Organization>): Promise<Organization> {
		const now = new Date().toISOString();
		return new Promise((resolve, reject) => {
			// First check if the business exists
			this.getById(id)
				.then((existingBusiness) => {
					// Build the SET clause dynamically based on provided data
					const updates: string[] = [];
					const values: string[] = [];

					if (data.name !== undefined) {
						updates.push('name = ?');
						values.push(data.name);
					}
					if (data.description !== undefined) {
						updates.push('description = ?');
						values.push(data.description);
					}
					if (data.imageUrl !== undefined) {
						updates.push('imageUrl = ?');
						values.push(data.imageUrl);
					}
					if (data.website !== undefined) {
						updates.push('website = ?');
						values.push(data.website);
					}
					if (data.industry !== undefined) {
						updates.push('industry = ?');
						values.push(data.industry);
					}

					// Always update the updatedAt timestamp
					updates.push('updatedAt = ?');
					values.push(now);

					// Add the ID as the last parameter for the WHERE clause
					values.push(id);

					const updateQuery = `UPDATE ${this.table} SET ${updates.join(', ')} WHERE id = ?`;

					db.run(updateQuery, values, (err) => {
						if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
						resolve({ ...existingBusiness, ...data, updatedAt: now } as Organization);
					});
				})
				.catch((err) => {
					reject(err); // Pass through the NotFoundError from getById
				});
		});
	}

	async delete(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(`DELETE FROM ${this.table} WHERE id = ?`, [id], (err) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				resolve();
			});
		});
	}

	// Business-specific methods
	async getBusinessesByUserId(userId: string): Promise<Organization[]> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT o.* FROM organizations o 
         JOIN organization_members m ON o.id = m.organizationId 
         WHERE m.userId = ? AND m.isActive = true 
         ORDER BY b.name ASC`,
				[userId],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					resolve(rows as Organization[]);
				},
			);
		});
	}

	async getBusinessByPrimaryAdmin(userId: string): Promise<Organization | null> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT b.* FROM businesses b 
         JOIN business_members m ON b.id = m.businessId 
         WHERE m.userId = ? AND m.isPrimary = true AND m.role = 'admin' 
         LIMIT 1`,
				[userId],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					if (rows.length === 0) return resolve(null);
					resolve(rows[0] as Organization);
				},
			);
		});
	}
}

export class DuckDbBusinessMemberDataAccess {
	private table = 'business_members';

	async getMemberById(id: string): Promise<OrganizationMember> {
		return new Promise((resolve, reject) => {
			db.all(`SELECT * FROM ${this.table} WHERE id = ?`, [id], (err, rows) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				if (!rows.length) return reject(new NotFoundError('OrganizationMember', id));
				resolve(rows[0] as OrganizationMember);
			});
		});
	}

	async getMembersByBusinessId(businessId: string): Promise<OrganizationMember[]> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT m.*, u.name, u.email FROM ${this.table} m
         JOIN users u ON m.userId = u.id
         WHERE m.organizationId = ?
         ORDER BY m.isPrimary DESC, m.role ASC, u.name ASC`,
				[businessId],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));

					// Transform the rows to include user data
					const members = rows.map((row: unknown) => {
						const { name, email, ...memberData } = row as { name: string; email: string; [key: string]: string };
						return {
							...memberData,
							user: { id: (row as { userId: string }).userId, name, email },
						} as OrganizationMember;
					});

					resolve(members);
				},
			);
		});
	}

	async getMemberByBusinessAndUser(
		businessId: string,
		userId: string,
	): Promise<OrganizationMember | null> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT * FROM ${this.table} WHERE organizationId = ? AND userId = ?`,
				[businessId, userId],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					if (rows.length === 0) return resolve(null);
					resolve(rows[0] as OrganizationMember);
				},
			);
		});
	}

	async addMember(
		organizationId: string,
		userId: string,
		role: string,
		isPrimary: boolean = false,
	): Promise<OrganizationMember> {
		const id = `bm_${randomUUID()}`;
		const now = new Date().toISOString();

		return new Promise((resolve, reject) => {
			// Check if the member already exists
			this.getMemberByBusinessAndUser(organizationId, userId)
				.then((existingMember) => {
					if (existingMember) {
						return reject(new DataAccessError(`User is already a member of this organization`, 400));
					}

					// Add the new member
					db.run(
						`INSERT INTO ${this.table} (id, organizationId, userId, role, isActive, isPrimary, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
						[id, organizationId, userId, role, true, isPrimary, now, now],
						(err) => {
							if (err)
								return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
							resolve({
								id,
								organizationId,
								userId,
								role,
								isActive: true,
								isPrimary,
								createdAt: now,
								updatedAt: now,
							} as OrganizationMember);
						},
					);
				})
				.catch((err) => reject(err));
		});
	}

	async updateMember(id: string, data: Partial<OrganizationMember>): Promise<OrganizationMember> {
		const now = new Date().toISOString();

		return new Promise((resolve, reject) => {
			// First check if the member exists
			this.getMemberById(id)
				.then((existingMember) => {
					// Build the SET clause dynamically based on provided data
					const updates: string[] = [];
					const values: string[] = [];

					if (data.role !== undefined) {
						updates.push('role = ?');
						values.push(data.role);
					}
					if (data.isActive !== undefined) {
						updates.push('isActive = ?');
						values.push(data.isActive ? 'true' : 'false');
					}
					if (data.isPrimary !== undefined) {
						updates.push('isPrimary = ?');
						values.push(data.isPrimary ? 'true' : 'false');

						// If setting as primary, unset any other primary members for this business
						if (data.isPrimary) {
							db.run(
								`UPDATE ${this.table} SET isPrimary = false WHERE organizationId = ? AND id != ?`,
								[existingMember.organizationId, id],
								(err) => {
									if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
								},
							);
						}
					}

					// Always update the updatedAt timestamp
					updates.push('updatedAt = ?');
					values.push(now);

					// Add the ID as the last parameter for the WHERE clause
					values.push(id);

					const updateQuery = `UPDATE ${this.table} SET ${updates.join(', ')} WHERE id = ?`;

					db.run(updateQuery, values, (err) => {
						if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
						resolve({ ...existingMember, ...data, updatedAt: now } as OrganizationMember);
					});
				})
				.catch((err) => {
					reject(err); // Pass through the NotFoundError from getMemberById
				});
		});
	}

	async removeMember(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			// First check if this is a primary admin
			this.getMemberById(id)
				.then((member) => {
					if (member.isPrimary && member.role === 'admin') {
						return reject(new DataAccessError(`Cannot remove the primary admin`, 400));
					}

					db.run(`DELETE FROM ${this.table} WHERE id = ?`, [id], (err) => {
						if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
						resolve();
					});
				})
				.catch((err) => reject(err));
		});
	}

	async getBusinessRoleForUser(organizationId: string, userId: string): Promise<string | null> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT role FROM ${this.table} WHERE organizationId = ? AND userId = ? AND isActive = true`,
				[organizationId, userId],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					if (rows.length === 0) return resolve(null);
					resolve((rows[0] as { role: string }).role);
				},
			);
		});
	}

	async isPrimaryAdmin(organizationId: string, userId: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT isPrimary FROM ${this.table} WHERE organizationId = ? AND userId = ? AND role = 'admin' AND isActive = true`,
				[organizationId, userId],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					if (rows.length === 0) return resolve(false);
					resolve(Boolean((rows[0] as { isPrimary: boolean }).isPrimary));
				},
			);
		});
	}
}

export class DuckDbBusinessInviteDataAccess {
	private table = 'business_invites';

	async getInviteById(id: string): Promise<OrganizationInvite> {
		return new Promise((resolve, reject) => {
			db.all(`SELECT * FROM ${this.table} WHERE id = ?`, [id], (err, rows) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				if (!rows.length) return reject(new NotFoundError('OrganizationInvite', id));
				resolve(rows[0] as OrganizationInvite);
			});
		});
	}

	async getInvitesByBusinessId(businessId: string): Promise<OrganizationInvite[]> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT * FROM ${this.table} WHERE organizationId = ? ORDER BY createdAt DESC`,
				[businessId],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					resolve(rows as OrganizationInvite[]);
				},
			);
		});
	}

	async getInviteByToken(token: string): Promise<OrganizationInvite | null> {
		return new Promise((resolve, reject) => {
			db.all(`SELECT * FROM ${this.table} WHERE token = ?`, [token], (err, rows) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				if (rows.length === 0) return resolve(null);
				resolve(rows[0] as OrganizationInvite);
			});
		});
	}

	async getInviteByEmail(organizationId: string, email: string): Promise<OrganizationInvite | null> {
		return new Promise((resolve, reject) => {
			db.all(
				`SELECT * FROM ${this.table} WHERE organizationId = ? AND email = ?`,
				[organizationId, email],
				(err, rows) => {
					if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
					if (rows.length === 0) return resolve(null);
					resolve(rows[0] as OrganizationInvite);
				},
			);
		});
	}

	async createInvite(organizationId: string, email: string, role: string): Promise<OrganizationInvite> {
		const id = `inv_${randomUUID()}`;
		const token = randomUUID();
		const now = new Date();
		const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

		return new Promise((resolve, reject) => {
			// Check if an invite already exists for this email
			this.getInviteByEmail(organizationId, email)
				.then((existingInvite) => {
					if (existingInvite) {
						return reject(new DataAccessError(`An invite already exists for this email`, 400));
					}

					// Create the new invite
					db.run(
						`INSERT INTO ${this.table} (id, organizationId, email, role, token, expiresAt, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
						[
							id,
							organizationId,
							email,
							role,
							token,
							expiresAt.toISOString(),
							now.toISOString(),
							now.toISOString(),
						],
						(err) => {
							if (err)
								return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
							resolve({
								id,
								organizationId,
								email,
								role,
								token,
								expiresAt: expiresAt.toISOString(),
								createdAt: now.toISOString(),
								updatedAt: now.toISOString(),
							} as OrganizationInvite);
						},
					);
				})
				.catch((err) => reject(err));
		});
	}

	async deleteInvite(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(`DELETE FROM ${this.table} WHERE id = ?`, [id], (err) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				resolve();
			});
		});
	}

	async deleteInviteByToken(token: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(`DELETE FROM ${this.table} WHERE token = ?`, [token], (err) => {
				if (err) return reject(new DataAccessError(`Database error: ${err.message}`, 500, err));
				resolve();
			});
		});
	}
}

export const businessDuckDBDataAccess = new DuckDbBusinessDataAccess();
export const businessMemberDuckDBDataAccess = new DuckDbBusinessMemberDataAccess();
export const businessInviteDuckDBDataAccess = new DuckDbBusinessInviteDataAccess();
