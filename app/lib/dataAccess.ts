import { DataAccessInterface } from '@/app/contracts/DataAccess';

/**
 * Standardized error types for data access operations
 */
export class DataAccessError extends Error {
  constructor(
    message: string, 
    public statusCode: number = 500, 
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DataAccessError';
  }
}

export class NotFoundError extends DataAccessError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DataAccessError {
  constructor(message: string, public fieldErrors?: Record<string, string[]>) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Batch operation utilities for data access layers
 */
export async function batchGetByIds<T extends { id: string }>(
  dataAccess: DataAccessInterface<T>,
  ids: string[]
): Promise<Map<string, T>> {
  if (!ids.length) return new Map();
  
  // Use built-in batch method if available
  if (dataAccess.getAllByIds) {
    const items = await dataAccess.getAllByIds(ids);
    return new Map(items.map(item => [item.id, item]));
  }
  
  // Deduplicate IDs
  const uniqueIds = Array.from(new Set(ids));
  
  // Execute all promises in parallel
  const results = await Promise.all(
    uniqueIds.map(async id => {
      try {
        const item = await dataAccess.getById(id);
        return { id, item, success: true };
      } catch (error) {
        console.error(`Failed to fetch item with id ${id}:`, error);
        return { id, success: false, error };
      }
    })
  );
  
  // Build map of successful results
  const resultMap = new Map<string, T>();
  for (const result of results) {
    if (result.success) {
      resultMap.set(result.id, result.item as T);
    }
  }
  
  return resultMap;
}

/**
 * Batch create utility
 */
export async function batchCreate<T>(
  dataAccess: DataAccessInterface<T>,
  items: Partial<T>[]
): Promise<T[]> {
  if (!items.length) return [];
  
  // Use built-in batch method if available
  if (dataAccess.batchCreate) {
    return dataAccess.batchCreate(items);
  }
  
  // Execute all promises in parallel
  const results = await Promise.all(
    items.map(async item => {
      try {
        return await dataAccess.create(item);
      } catch (error) {
        console.error(`Failed to create item:`, error);
        throw error;
      }
    })
  );
  
  return results;
}

/**
 * Batch update utility
 */
export async function batchUpdate<T>(
  dataAccess: DataAccessInterface<T>,
  updates: Array<{ id: string; data: Partial<T> }>
): Promise<Map<string, T>> {
  if (!updates.length) return new Map();
  
  // Use built-in batch method if available
  if (dataAccess.batchUpdate) {
    const updatedItems = await dataAccess.batchUpdate(updates);
    return new Map(updatedItems.map(item => [
      // This assumes item has an id property, which might not be true for all T
      // We'll need to cast to any to avoid TypeScript errors
      (item as unknown as { id: string }).id, 
      item
    ]));
  }
  
  // Execute all promises in parallel
  const results = await Promise.all(
    updates.map(async ({ id, data }) => {
      try {
        const item = await dataAccess.update(id, data);
        return { id, item, success: true };
      } catch (error) {
        console.error(`Failed to update item with id ${id}:`, error);
        return { id, success: false, error };
      }
    })
  );
  
  // Build map of successful results
  const resultMap = new Map<string, T>();
  for (const result of results) {
    if (result.success) {
      resultMap.set(result.id, result.item as T);
    }
  }
  
  return resultMap;
}