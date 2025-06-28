'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { useMemo } from 'react';

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  isGlobalAdmin: boolean;
  isOrgAdmin: boolean;
  isOrgMember: boolean;
  hasOrganization: boolean;
  organization: any;
  sessionClaims: any;
  canAccessChat: boolean;
}

/**
 * Custom hook that ensures consistent authentication state handling
 * and prevents "rendered more hooks than during the previous render" errors
 */
export function useAuthGuard(): AuthState {
  // Always call hooks unconditionally - this is critical
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();
  const { organization } = useOrganization();

  // Use useMemo to compute derived state to prevent unnecessary re-renders
  const authState = useMemo((): AuthState => {
    const userRole = sessionClaims?.metadata?.role;
    const orgRole = sessionClaims?.org_role;
    
    const isGlobalAdmin = userRole === 'global_admin' || userRole === 'admin';
    const isOrgAdmin = userRole === 'org_admin' || orgRole === 'org:admin';
    const isOrgMember = userRole === 'org_member' || orgRole === 'org:member';
    const hasOrganization = !!organization;
    
    // Global admins can always access chat, org users need organization context
    const canAccessChat = isGlobalAdmin || (isSignedIn && hasOrganization);

    return {
      isLoaded,
      isSignedIn: !!isSignedIn,
      isGlobalAdmin,
      isOrgAdmin,
      isOrgMember,
      hasOrganization,
      organization,
      sessionClaims,
      canAccessChat
    };
  }, [isLoaded, isSignedIn, sessionClaims, organization]);

  return authState;
} 