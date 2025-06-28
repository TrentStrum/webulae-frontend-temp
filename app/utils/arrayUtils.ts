/**
 * Array manipulation utilities
 */

/**
 * Group an array of objects by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from an array
 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates from an array of objects by a key
 */
export function uniqueByKey<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Sort an array of objects by a key
 */
export function sortByKey<T>(
  array: T[], 
  key: keyof T, 
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];
    
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Chunk an array into smaller arrays of a specified size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  return array.reduce((result, item, index) => {
    const chunkIndex = Math.floor(index / size);
    
    if (!result[chunkIndex]) {
      result[chunkIndex] = [];
    }
    
    result[chunkIndex].push(item);
    return result;
  }, [] as T[][]);
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Find the intersection of two arrays
 */
export function intersection<T>(arrayA: T[], arrayB: T[]): T[] {
  return arrayA.filter(item => arrayB.includes(item));
}

/**
 * Find the difference between two arrays
 */
export function difference<T>(arrayA: T[], arrayB: T[]): T[] {
  return arrayA.filter(item => !arrayB.includes(item));
}

/**
 * Flatten a nested array
 */
export function flattenArray<T>(array: (T | T[])[]): T[] {
  return array.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, [] as T[]);
}

/**
 * Create a range of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}