'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';

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
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href={getDashboardLink(user)}>Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}