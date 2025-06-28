import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { Post } from '@/app/types';
import { db } from '@/app/lib/duckdb/serverConnection';

export class DuckDbPostDataAccess implements DataAccessInterface<Post> {
  private table = 'posts';

  async getById(id: string): Promise<Post> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          slug,
          title,
          content,
          tags,
          isPremium,
          createdAt,
          updatedAt
        FROM ${this.table} 
        WHERE id = ?
      `, [id], (err, rows) => {
        if (err) return reject(err);
        if (!rows.length) return reject(new Error(`Post with id ${id} not found`));
        
        const post = rows[0] as Post;
        // Parse tags if they're stored as JSON string
        if (typeof post.tags === 'string') {
          try {
            post.tags = JSON.parse(post.tags);
          } catch {
            post.tags = [];
          }
        }
        resolve(post);
      });
    });
  }

  async getAll(): Promise<Post[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          slug,
          title,
          content,
          tags,
          isPremium,
          createdAt,
          updatedAt
        FROM ${this.table} 
        ORDER BY createdAt DESC
      `, [], (err, rows) => {
        if (err) return reject(err);
        
        const posts = rows.map((row: any) => {
          const post = row as Post;
          // Parse tags if they're stored as JSON string
          if (typeof post.tags === 'string') {
            try {
              post.tags = JSON.parse(post.tags);
            } catch {
              post.tags = [];
            }
          }
          return post;
        });
        
        resolve(posts);
      });
    });
  }

  async create(data: Partial<Post>): Promise<Post> {
    const id = `post_${Date.now()}`;
    const now = new Date().toISOString();
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]';
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO ${this.table} (
          id,
          slug,
          title,
          content,
          tags,
          isPremium,
          createdAt,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        data.slug || `post-${Date.now()}`,
        data.title || '',
        data.content || '',
        tags,
        data.isPremium ? 1 : 0,
        now,
        now
      ], (err) => {
        if (err) return reject(err);
        resolve({ 
          ...data, 
          id, 
          tags: Array.isArray(data.tags) ? data.tags : [],
          isPremium: Boolean(data.isPremium),
          createdAt: now, 
          updatedAt: now 
        } as Post);
      });
    });
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const now = new Date().toISOString();
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : undefined;
    
    return new Promise((resolve, reject) => {
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (data.slug !== undefined) {
        updateFields.push('slug = ?');
        updateValues.push(data.slug);
      }
      if (data.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(data.title);
      }
      if (data.content !== undefined) {
        updateFields.push('content = ?');
        updateValues.push(data.content);
      }
      if (tags !== undefined) {
        updateFields.push('tags = ?');
        updateValues.push(tags);
      }
      if (data.isPremium !== undefined) {
        updateFields.push('isPremium = ?');
        updateValues.push(data.isPremium ? 1 : 0);
      }
      
      updateFields.push('updatedAt = ?');
      updateValues.push(now);
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
}

export const postDuckDBDataAccess = new DuckDbPostDataAccess(); 