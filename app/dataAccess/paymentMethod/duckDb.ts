import type { PaymentMethod } from '@/app/types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { db } from '@/app/lib/duckdb/serverConnection';

export class DuckDbPaymentMethodDataAccess implements DataAccessInterface<PaymentMethod> {
    private table = 'payment_methods';

    async getById(id: string): Promise<PaymentMethod> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, userId, stripePaymentMethodId, type, last4, createdAt, updatedAt 
                FROM ${this.table} 
                WHERE id = ?
            `;
            db.all(query, [id], (err, rows) => {
                if (err) return reject(err);
                if (!rows.length) return reject(new Error('Payment method not found'));
                resolve(rows[0] as PaymentMethod);
            });
        });
    }

    async getAll(): Promise<PaymentMethod[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, userId, stripePaymentMethodId, type, last4, createdAt, updatedAt 
                FROM ${this.table}
                ORDER BY createdAt DESC
            `;
            db.all(query, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows as PaymentMethod[]);
            });
        });
    }

    async create(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
        const id = `pay_${Date.now()}`;
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO ${this.table} (id, userId, stripePaymentMethodId, type, last4, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(query, [
                id,
                data.userId || '',
                data.stripePaymentMethodId || '',
                data.type || '',
                data.last4 || '',
                now,
                now
            ], (err) => {
                if (err) return reject(err);
                resolve({ ...data, id, createdAt: now, updatedAt: now } as PaymentMethod);
            });
        });
    }

    async update(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            // Build dynamic update query
            const updateFields: string[] = [];
            const updateValues: any[] = [];
            
            if (data.userId !== undefined) {
                updateFields.push('userId = ?');
                updateValues.push(data.userId);
            }
            if (data.stripePaymentMethodId !== undefined) {
                updateFields.push('stripePaymentMethodId = ?');
                updateValues.push(data.stripePaymentMethodId);
            }
            if (data.type !== undefined) {
                updateFields.push('type = ?');
                updateValues.push(data.type);
            }
            if (data.last4 !== undefined) {
                updateFields.push('last4 = ?');
                updateValues.push(data.last4);
            }
            
            updateFields.push('updatedAt = ?');
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

export const paymentMethodDuckDBDataAccess = new DuckDbPaymentMethodDataAccess();
