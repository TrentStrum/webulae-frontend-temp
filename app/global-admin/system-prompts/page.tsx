import { Metadata } from 'next';
import { GlobalAdminSystemPromptsManager } from '@/app/components/admin/GlobalAdminSystemPromptsManager';
import { BotIdentityGuide } from '@/app/components/admin/system-prompts/BotIdentityGuide';

export const metadata: Metadata = {
  title: 'System Prompts Management | Webulae Admin',
  description: 'Manage company-wide and organization-specific system prompts for AI assistant behavior',
};

export default function GlobalAdminSystemPromptsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <BotIdentityGuide />
      <GlobalAdminSystemPromptsManager />
    </div>
  );
} 