import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AuthCallback(): Promise<never> {
  const { userId, sessionClaims, orgRole } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const userRole = sessionClaims?.metadata?.role;
  const isGlobalAdmin = userRole === 'global_admin' || userRole === 'admin';
  if (isGlobalAdmin) {
    redirect('/global-admin');
  }

  const isOrgAdmin = orgRole === 'org:admin' || sessionClaims?.org_role === 'org:admin';
  if (isOrgAdmin) {
    redirect('/org-admin');
  }

  redirect('/dashboard');
}
