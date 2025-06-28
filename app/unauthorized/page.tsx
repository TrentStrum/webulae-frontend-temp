'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100/30 via-background to-secondary-100/30 dark:from-primary-900/10 dark:via-background dark:to-secondary-900/10 p-4">
      <Card className="max-w-md w-full border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild className="w-full gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full gap-2" onClick={() => window.history.back()}>
              <div>
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}