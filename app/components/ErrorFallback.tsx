'use client';

export function ErrorFallback() {
  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">We&apos;ve encountered an error. Please try refreshing the page.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Refresh Page
      </button>
    </div>
  );
} 