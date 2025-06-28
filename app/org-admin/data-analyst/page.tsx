'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { IconDatabase, IconBrain, IconChartBar, IconSettings, IconPlus } from '@tabler/icons-react';
import { useAirtableConfigs, useAirtableSetup } from '@/app/hooks/useAirtable';
import { AirtableSetupWizard } from '@/app/components/airtable/AirtableSetupWizard';
import { DataAnalysisForm } from '@/app/components/airtable/DataAnalysisForm';
import { AnalysisResults } from '@/app/components/airtable/AnalysisResults';
import { DatabaseDesignForm } from '@/app/components/airtable/DatabaseDesignForm';
import { AirtableConfig } from '@/app/types/airtable.types';

export default function DataAnalystPage() {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AirtableConfig | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: configsData, isLoading: configsLoading } = useAirtableConfigs();
  const { deleteConfig } = useAirtableSetup();

  const configs = configsData?.data || [];

  const handleSetupComplete = (configId: string) => {
    setShowSetupWizard(false);
    // Refresh configs
    window.location.reload();
  };

  const handleDeleteConfig = async (configId: string) => {
    if (confirm('Are you sure you want to delete this Airtable configuration?')) {
      try {
        await deleteConfig.mutateAsync(configId);
        if (selectedConfig?.id === configId) {
          setSelectedConfig(null);
        }
      } catch (error) {
        console.error('Error deleting config:', error);
      }
    }
  };

  if (showSetupWizard) {
    return (
      <AirtableSetupWizard
        onComplete={handleSetupComplete}
        onCancel={() => setShowSetupWizard(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IconBrain className="h-8 w-8 text-primary" />
            Data Analyst Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered data analysis and insights from your Airtable databases
          </p>
        </div>
        <Button onClick={() => setShowSetupWizard(true)} className="flex items-center gap-2">
          <IconPlus className="h-4 w-4" />
          Connect Airtable
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
          <TabsTrigger value="design">Database Design</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab 
            configs={configs} 
            isLoading={configsLoading}
            selectedConfig={selectedConfig}
            onSelectConfig={setSelectedConfig}
            onDeleteConfig={handleDeleteConfig}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <AnalysisTab 
            configs={configs}
            selectedConfig={selectedConfig}
            onSelectConfig={setSelectedConfig}
          />
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <DatabaseDesignTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsTab 
            configs={configs}
            onDeleteConfig={handleDeleteConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Tab Components
interface OverviewTabProps {
  configs: AirtableConfig[];
  isLoading: boolean;
  selectedConfig: AirtableConfig | null;
  onSelectConfig: (config: AirtableConfig) => void;
  onDeleteConfig: (configId: string) => void;
}

function OverviewTab({ configs, isLoading, selectedConfig, onSelectConfig, onDeleteConfig }: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <IconDatabase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Airtable Connections</h3>
          <p className="text-muted-foreground mb-4">
            Connect your first Airtable base to start analyzing your data with AI
          </p>
          <Button onClick={() => window.location.reload()}>
            Connect Airtable
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Bases</p>
                <p className="text-2xl font-bold">{configs.length}</p>
              </div>
              <IconDatabase className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">
                  {configs.filter(c => c.isActive).length}
                </p>
              </div>
              <IconBrain className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                <p className="text-2xl font-bold">
                  {configs.some(c => c.lastSyncAt) ? '✓' : '—'}
                </p>
              </div>
              <IconChartBar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Bases */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Airtable Bases</CardTitle>
          <CardDescription>
            Select a base to analyze or manage your connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedConfig?.id === config.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => onSelectConfig(config)}
              >
                <div className="flex items-center gap-3">
                  <IconDatabase className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{config.baseName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Base ID: {config.baseId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.isActive ? 'default' : 'secondary'}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConfig(config.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {selectedConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common analysis tasks for {selectedConfig.baseName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => setActiveTab('analysis')}
              >
                <IconBrain className="h-5 w-5" />
                <div>
                  <div className="font-medium">Analyze Data</div>
                  <div className="text-sm text-muted-foreground">
                    Ask questions about your data
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => setActiveTab('design')}
              >
                <IconDatabase className="h-5 w-5" />
                <div>
                  <div className="font-medium">Database Design</div>
                  <div className="text-sm text-muted-foreground">
                    Get AI suggestions for your schema
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface AnalysisTabProps {
  configs: AirtableConfig[];
  selectedConfig: AirtableConfig | null;
  onSelectConfig: (config: AirtableConfig) => void;
}

function AnalysisTab({ configs, selectedConfig, onSelectConfig }: AnalysisTabProps) {
  if (configs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <IconDatabase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Airtable Connections</h3>
          <p className="text-muted-foreground">
            Connect an Airtable base to start analyzing your data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Base to Analyze</CardTitle>
            <CardDescription>
              Choose which Airtable base you'd like to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:border-primary/50"
                  onClick={() => onSelectConfig(config)}
                >
                  <div className="flex items-center gap-3">
                    <IconDatabase className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{config.baseName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Base ID: {config.baseId}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.isActive ? 'default' : 'secondary'}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedConfig && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDatabase className="h-5 w-5" />
                Analyzing: {selectedConfig.baseName}
              </CardTitle>
              <CardDescription>
                Ask questions about your data and get AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataAnalysisForm configId={selectedConfig.id} />
            </CardContent>
          </Card>

          <AnalysisResults configId={selectedConfig.id} />
        </div>
      )}
    </div>
  );
}

function DatabaseDesignTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconDatabase className="h-5 w-5" />
          AI Database Design Assistant
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions for designing your Airtable database structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DatabaseDesignForm />
      </CardContent>
    </Card>
  );
}

interface SettingsTabProps {
  configs: AirtableConfig[];
  onDeleteConfig: (configId: string) => void;
}

function SettingsTab({ configs, onDeleteConfig }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSettings className="h-5 w-5" />
            Airtable Connections
          </CardTitle>
          <CardDescription>
            Manage your connected Airtable bases and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <IconDatabase className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{config.baseName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Connected: {new Date(config.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.isActive ? 'default' : 'secondary'}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteConfig(config.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Preferences</CardTitle>
          <CardDescription>
            Configure default settings for data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Analysis preferences will be configurable here in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 