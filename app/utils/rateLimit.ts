export class RateLimiter {
  private readonly cache = new Map<string, { count: number; timestamp: number }>();
  readonly windowMs: number;
  readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.cache.get(key) || { count: 0, timestamp: now };
    
    // Reset if window has passed
    if (now - entry.timestamp > this.windowMs) {
      entry.count = 0;
      entry.timestamp = now;
    }
    
    const remaining = this.maxRequests - entry.count;
    const success = remaining > 0;
    
    if (success) {
      entry.count++;
      this.cache.set(key, entry);
    }
    
    return {
      success,
      remaining: Math.max(0, remaining),
      resetTime: entry.timestamp + this.windowMs
    };
  }
}

// Create a global rate limiter instance
export const apiRateLimiter = new RateLimiter();