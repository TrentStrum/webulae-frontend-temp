export interface AppError extends Error {
  status?: number;
  details?: unknown;
}

export interface ValidationError extends AppError {
  fieldErrors?: Record<string, string[]>;
}

export interface AuthError extends AppError {
  code?: string;
}