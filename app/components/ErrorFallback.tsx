'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorFallback() {
  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-center">Something went wrong</CardTitle>
          <CardDescription className="text-center">
            We've encountered an error. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            If the problem persists, please contact support with details about what you were doing when the error occurred.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => window.location.reload()} 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}