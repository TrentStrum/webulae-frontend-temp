/**
 * Performance Service
 * 
 * Handles caching, response time optimization, and performance monitoring
 * for improved user experience and system efficiency.
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  throughput: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableCompression: boolean;
}

export class PerformanceService {
  private static instance: PerformanceService;
  private cache = new Map<string, CacheEntry>();
  private metrics: PerformanceMetrics[] = [];
  private config: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 60 * 1000, // 1 minute
    enableCompression: false
  };

  private constructor() {
    this.startCleanupInterval();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Set cache configuration
   */
  setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, entry);
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
    averageTTL: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const averageTTL = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.ttl, 0) / entries.length 
      : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track misses to calculate
      totalAccesses,
      averageTTL
    };
  }

  /**
   * Evict least used entries when cache is full
   */
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort(([,a], [,b]) => a.accessCount - b.accessCount);
    
    // Remove 10% of least used entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Measure function execution time
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T>,
    label: string
  ): Promise<{ result: T; executionTime: number }> {
    const start = performance.now();
    const result = await fn();
    const executionTime = performance.now() - start;

    // Log performance metric
    PerformanceService.getInstance().recordMetric({
      responseTime: executionTime,
      cacheHitRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorRate: 0,
      throughput: 0
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${executionTime.toFixed(2)}ms`);
    }

    return { result, executionTime };
  }

  /**
   * Record performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get performance analytics
   */
  getAnalytics(timeWindow: number = 60 * 60 * 1000): {
    averageResponseTime: number;
    averageCacheHitRate: number;
    averageMemoryUsage: number;
    averageCpuUsage: number;
    averageErrorRate: number;
    averageThroughput: number;
    totalRequests: number;
  } {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < timeWindow);

    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        averageCacheHitRate: 0,
        averageMemoryUsage: 0,
        averageCpuUsage: 0,
        averageErrorRate: 0,
        averageThroughput: 0,
        totalRequests: 0
      };
    }

    const sum = recentMetrics.reduce((acc, metric) => ({
      responseTime: acc.responseTime + metric.responseTime,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      errorRate: acc.errorRate + metric.errorRate,
      throughput: acc.throughput + metric.throughput
    }), {
      responseTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorRate: 0,
      throughput: 0
    });

    return {
      averageResponseTime: sum.responseTime / recentMetrics.length,
      averageCacheHitRate: sum.cacheHitRate / recentMetrics.length,
      averageMemoryUsage: sum.memoryUsage / recentMetrics.length,
      averageCpuUsage: sum.cpuUsage / recentMetrics.length,
      averageErrorRate: sum.errorRate / recentMetrics.length,
      averageThroughput: sum.throughput / recentMetrics.length,
      totalRequests: recentMetrics.length
    };
  }
}

/**
 * HTTP Response Caching Middleware
 */
export class ResponseCache {
  private static cache = new Map<string, { response: Response; timestamp: number; ttl: number }>();

  /**
   * Cache HTTP response
   */
  static cacheResponse(
    key: string,
    response: Response,
    ttl: number = 5 * 60 * 1000
  ): void {
    this.cache.set(key, {
      response: response.clone(),
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cached response
   */
  static getCachedResponse(key: string): Response | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response.clone();
  }

  /**
   * Generate cache key from request
   */
  static generateKey(request: Request): string {
    const url = new URL(request.url);
    const method = request.method;
    const body = request.body ? JSON.stringify(request.body) : '';
    
    return `${method}:${url.pathname}:${url.search}:${body}`;
  }
}

/**
 * Database Query Optimization
 */
export class QueryOptimizer {
  private static queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();

  /**
   * Cache database query result
   */
  static cacheQuery(
    query: string,
    params: any[],
    result: any,
    ttl: number = 2 * 60 * 1000 // 2 minutes for DB queries
  ): void {
    const key = this.generateQueryKey(query, params);
    this.queryCache.set(key, {
      result,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cached query result
   */
  static getCachedQuery(query: string, params: any[]): any | null {
    const key = this.generateQueryKey(query, params);
    const entry = this.queryCache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.queryCache.delete(key);
      return null;
    }

    return entry.result;
  }

  /**
   * Generate cache key for query
   */
  private static generateQueryKey(query: string, params: any[]): string {
    return `${query}:${JSON.stringify(params)}`;
  }

  /**
   * Optimize query with pagination
   */
  static optimizeQuery(query: string, page: number = 1, limit: number = 20): string {
    const offset = (page - 1) * limit;
    return `${query} LIMIT ${limit} OFFSET ${offset}`;
  }

  /**
   * Add query hints for better performance
   */
  static addQueryHints(query: string, hints: string[]): string {
    if (hints.length === 0) return query;
    
    const hintString = hints.join(' ');
    return `/*+ ${hintString} */ ${query}`;
  }
}

/**
 * Memory Management
 */
export class MemoryManager {
  private static memoryThreshold = 0.8; // 80% of available memory
  private static cleanupCallbacks: (() => void)[] = [];

  /**
   * Register cleanup callback
   */
  static registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Check memory usage and trigger cleanup if needed
   */
  static checkMemoryUsage(): boolean {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usageRatio > this.memoryThreshold) {
        this.triggerCleanup();
        return true;
      }
    }
    return false;
  }

  /**
   * Trigger memory cleanup
   */
  private static triggerCleanup(): void {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Memory cleanup callback failed:', error);
      }
    });

    // Force garbage collection if available
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
    }
  }

  /**
   * Get memory usage statistics
   */
  static getMemoryStats(): {
    used: number;
    total: number;
    limit: number;
    usageRatio: number;
  } | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      };
    }
    return null;
  }
} 