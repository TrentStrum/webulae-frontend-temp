'use client';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // MSW is disabled for now - using DuckDB instead
  return <>{children}</>;
}