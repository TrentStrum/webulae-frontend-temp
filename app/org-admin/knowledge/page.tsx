'use client';

import { useOrganization } from '@clerk/nextjs';
import { OrganizationKnowledgeManager } from '@/app/components/admin/OrganizationKnowledgeManager';
import { QuickOrganizationKnowledgeForm } from '@/app/components/admin/QuickOrganizationKnowledgeForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Brain, Settings } from 'lucide-react';

export default function OrganizationKnowledgePage() {
  const { organization } = useOrganization();

  if (!organization) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p>No organization selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Management</h1>
        <p className="text-muted-foreground">
          Manage knowledge for {organization.name}'s chatbot
        </p>
      </div>

      <Tabs defaultValue="quick" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Quick Add
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-6">
          <QuickOrganizationKnowledgeForm
            organizationId={organization.id}
            organizationName={organization.name}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <OrganizationKnowledgeManager
            organizationId={organization.id}
            organizationName={organization.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 