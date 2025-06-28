'use client';

import { useAuthGuard } from '@/app/hooks/useAuthGuard';

export default function TestChatAccess() {
  const authState = useAuthGuard();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat Access Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Authentication Status</h2>
          <ul className="space-y-1 text-sm">
            <li>✅ Loaded: {authState.isLoaded ? 'Yes' : 'No'}</li>
            <li>✅ Signed In: {authState.isSignedIn ? 'Yes' : 'No'}</li>
            <li>✅ Has Organization: {authState.hasOrganization ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">User Role</h2>
          <ul className="space-y-1 text-sm">
            <li>🌍 Global Admin: {authState.isGlobalAdmin ? 'Yes' : 'No'}</li>
            <li>🏢 Org Admin: {authState.isOrgAdmin ? 'Yes' : 'No'}</li>
            <li>👤 Org Member: {authState.isOrgMember ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Chat Access</h2>
          <div className={`text-lg font-bold ${authState.canAccessChat ? 'text-green-600' : 'text-red-600'}`}>
            {authState.canAccessChat ? '✅ CAN ACCESS CHAT' : '❌ CANNOT ACCESS CHAT'}
          </div>
          
          {!authState.canAccessChat && (
            <div className="mt-2 text-sm text-gray-600">
              <p>To access chat, you need to:</p>
              <ul className="list-disc list-inside mt-1">
                {!authState.isSignedIn && <li>Sign in to your account</li>}
                {authState.isSignedIn && !authState.hasOrganization && <li>Select an organization</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Organization Info</h2>
          {authState.organization ? (
            <div className="text-sm">
              <p><strong>Name:</strong> {authState.organization.name}</p>
              <p><strong>ID:</strong> {authState.organization.id}</p>
              <p><strong>Role:</strong> {authState.sessionClaims?.org_role || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No organization selected</p>
          )}
        </div>

        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold mb-2">How Chat Access Works</h2>
          <ul className="text-sm space-y-1">
            <li>• <strong>Global Admins:</strong> Always have chat access</li>
            <li>• <strong>Org Admins:</strong> Need organization selected</li>
            <li>• <strong>Org Members:</strong> Need organization selected</li>
            <li>• <strong>Guest Users:</strong> Cannot access chat</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 