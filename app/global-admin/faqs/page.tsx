import { Metadata } from 'next';
import { GlobalAdminFAQsManager } from '@/app/components/admin/GlobalAdminFAQsManager';

export const metadata: Metadata = {
  title: 'FAQs Management | Webulae Admin',
  description: 'Manage company-wide and organization-specific frequently asked questions for AI assistant responses',
};

export default function FAQsPage() {
  return (
    <div className="container mx-auto py-6">
      <GlobalAdminFAQsManager />
    </div>
  );
} 