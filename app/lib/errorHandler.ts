import { AppError } from '@/app/types/error.types';

interface ErrorResponse {
  error: string;
  details?: unknown;
  status: number;
  fieldErrors?: Record<string, string[]>;
}

export function formatApiError(error: unknown): ErrorResponse {
  // If it's already an AppError with status
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    const appError = error as AppError;
    return {
      error: appError.message,
      details: appError.details,
      status: appError.status || 500,
      fieldErrors: 'fieldErrors' in appError ? (appError as unknown as { fieldErrors?: Record<string, string[]> }).fieldErrors : undefined
    };
  }
  
  // If it's a standard Error
  if (error instanceof Error) {
    return {
      error: error.message,
      details: error.stack,
      status: 500
    };
  }
  
  // If it's a string
  if (typeof error === 'string') {
    return {
      error,
      status: 500
    };
  }
  
  // Default case
  return {
    error: 'An unknown error occurred',
    details: error,
    status: 500
  };
}

export function logServerError(context: string, error: unknown): void {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}