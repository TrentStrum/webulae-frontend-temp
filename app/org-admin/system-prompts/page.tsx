import { Metadata } from 'next';
import { OrganizationSystemPromptsManager } from '@/app/components/admin/OrganizationSystemPromptsManager';

export const metadata: Metadata = {
  title: 'System Prompts Management | Organization Admin',
  description: 'Manage organization-specific system prompts for AI assistant behavior',
};

export default function OrganizationSystemPromptsPage() {
  return (
    <div className="container mx-auto py-6">
      <OrganizationSystemPromptsManager />
    </div>
  );
} 