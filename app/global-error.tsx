'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md">
            <AlertOctagon className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Critical Error</h1>
            <p className="text-muted-foreground mb-2">
              We apologize for the inconvenience. The application has encountered a critical error.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Error reference: {error.digest}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => reset()} variant="default">
                Try again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Go to homepage
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}