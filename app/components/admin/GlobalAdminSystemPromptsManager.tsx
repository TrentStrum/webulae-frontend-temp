'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Globe, Building2 } from 'lucide-react';
import { CompanySystemPromptsTab } from './system-prompts/CompanySystemPromptsTab';
import { OrganizationSystemPromptsTab } from './system-prompts/OrganizationSystemPromptsTab';

export const GlobalAdminSystemPromptsManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'company' | 'organization'>('company');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Global Admin System Prompts Management</h2>
          <p className="text-muted-foreground">
            Manage system prompts for company-wide and organization-specific AI behavior
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'company' | 'organization')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Company Prompts
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization Prompts
          </TabsTrigger>
        </TabsList>

        {/* Company System Prompts Tab */}
        <TabsContent value="company">
          <CompanySystemPromptsTab />
        </TabsContent>

        {/* Organization System Prompts Tab */}
        <TabsContent value="organization">
          <OrganizationSystemPromptsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 