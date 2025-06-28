import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimiter } from '@/app/utils/rateLimit';

type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<Response>;

export function withRateLimit(handler: RouteHandler) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    // Get client IP or fallback to a default
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               req.ip || 
               'unknown';
    
    // Create a unique key based on the IP and the route
    const key = `${ip}:${req.nextUrl.pathname}`;
    
    // Check rate limit
    const result = await apiRateLimiter.check(key);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          status: 429,
          resetAt: new Date(result.resetTime).toISOString() 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': apiRateLimiter.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    // Add rate limit headers to the response
    const response = await handler(req, ...args);
    
    // Clone the response to add headers
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Limit', apiRateLimiter.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    const responseClone = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
    
    return responseClone;
  };
}