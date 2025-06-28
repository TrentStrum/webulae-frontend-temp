/**
 * Type-safe fetch wrapper for making API requests
 */

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

export class FetchError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Type-safe fetch function that handles common error cases
 */
export async function typedFetch<T>(url: string, options?: FetchOptions): Promise<T> {
  // Prepare URL with query parameters
  const finalUrl = new URL(url, window.location.origin);
  
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        finalUrl.searchParams.append(key, String(value));
      }
    });
  }
  
  // Set up abort controller for timeout
  const controller = new AbortController();
  const { signal } = controller;
  
  let timeoutId: NodeJS.Timeout | undefined;
  if (options?.timeout) {
    timeoutId = setTimeout(() => controller.abort(), options.timeout);
  }
  
  try {
    const response = await fetch(finalUrl.toString(), {
      ...options,
      signal,
    });
    
    // Clear timeout if set
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If we can't parse JSON, use text
        errorData = await response.text();
      }
      
      throw new FetchError(
        errorData?.error || `Request failed with status ${response.status}`,
        response.status,
        response.statusText,
        errorData
      );
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json() as T;
    } else {
      // For non-JSON responses, return the response object itself
      return response as unknown as T;
    }
  } catch (error) {
    // Clear timeout if set
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Handle abort errors (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new FetchError('Request timed out', 408, 'Request Timeout');
    }
    
    // Re-throw FetchError instances
    if (error instanceof FetchError) {
      throw error;
    }
    
    // Handle other errors
    throw new FetchError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      'Unknown Error'
    );
  }
}

/**
 * Type-safe GET request
 */
export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
  return typedFetch<T>(url, { ...options, method: 'GET' });
}

/**
 * Type-safe POST request
 */
export async function post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  return typedFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Type-safe PUT request
 */
export async function put<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  return typedFetch<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Type-safe DELETE request
 */
export async function del<T>(url: string, options?: FetchOptions): Promise<T> {
  return typedFetch<T>(url, { ...options, method: 'DELETE' });
}