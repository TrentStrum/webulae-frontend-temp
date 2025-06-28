'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Function to get the appropriate dashboard link based on user role
const getDashboardLink = (user: UserResource | null | undefined) => {
  const userRole = user?.publicMetadata?.role;
  const orgRole = user?.organizationMemberships?.[0]?.role;
  
  // If user is global admin, go to global admin dashboard
  if (userRole === 'global_admin' || userRole === 'admin') {
    return '/global-admin';
  }
  
  // If user is org admin, go to org admin dashboard
  if (orgRole === 'org:admin') {
    return '/org-admin';
  }
  
  // Default to regular dashboard
  return '/dashboard';
};

export default function NotFound(): React.ReactElement {
  const { user } = useUser();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary-100/30 via-background to-secondary-100/30 dark:from-primary-900/10 dark:via-background dark:to-secondary-900/10">
      <Card className="max-w-md w-full border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            Sorry, the page you are looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild className="w-full gap-2">
              <Link href={getDashboardLink(user)}>
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}