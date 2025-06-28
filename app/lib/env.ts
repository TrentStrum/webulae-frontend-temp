/**
 * Utility for safely accessing environment variables
 * 
 * This ensures that:
 * 1. Required server-side variables are present
 * 2. Client-side code only accesses NEXT_PUBLIC_ variables
 */

// For server-side use only
export function getServerEnv(name: string, required = true): string {
  // Ensure this is only called on the server
  if (typeof window !== 'undefined') {
    throw new Error(`getServerEnv(${name}) was called on the client side. Use getClientEnv instead.`);
  }
  
  const value = process.env[name];
  if ((value === undefined || value === '') && required) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value ?? '';
}

// For client-side use
export function getClientEnv(name: string, required = true): string {
  // Ensure we're only accessing NEXT_PUBLIC_ variables on the client
  if (!name.startsWith('NEXT_PUBLIC_')) {
    throw new Error(`Client-side environment variables must start with NEXT_PUBLIC_: ${name}`);
  }
  
  const value = process.env[name];
  if ((value === undefined || value === '') && required) {
    console.warn(`Environment variable ${name} is required but not set`);
  }
  return value ?? '';
}

// General purpose function that automatically determines context
export function getEnv(name: string, required = true): string {
  // If we're on the client, only allow NEXT_PUBLIC_ variables
  if (typeof window !== 'undefined') {
    return getClientEnv(name, required);
  }
  
  // On the server, we can access any env var
  return getServerEnv(name, required);
}

// Service URL configurations
export const SERVICE_URLS = {
  // Legacy service (old monolithic architecture)
  PYTHON_SERVICE: getServerEnv('PYTHON_SERVICE_URL', false) || 'http://localhost:8000',
  
  // New modular service (new architecture)
  MODULAR_SERVICE: getServerEnv('MODULAR_SERVICE_URL', false) || 'http://localhost:8002',
  
  // Default admin organization ID
  DEFAULT_ADMIN_ORG: getServerEnv('DEFAULT_ADMIN_ORG_ID', false) || 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8'
} as const;

// Architecture configuration
export const ARCHITECTURE_CONFIG = {
  // Which service to use for different operations
  USE_MODULAR_FOR_CHAT: true,
  USE_MODULAR_FOR_DOCUMENTS: true,
  USE_MODULAR_FOR_KNOWLEDGE: true,
  
  // Fallback to legacy service if modular fails
  FALLBACK_TO_LEGACY: true,
  
  // Enable frontend prompt management
  ENABLE_FRONTEND_PROMPTS: true
} as const;