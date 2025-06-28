'use client';

import React, { useState } from 'react';
import { IntegrationMarketplace } from '@/app/components/admin/integrations/IntegrationMarketplace';
import { IntegrationDashboard } from '@/app/components/admin/integrations/IntegrationDashboard';
import { IntegrationTemplate, Integration } from '@/app/types/integrations.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Store, 
  Settings, 
  BarChart3, 
  Zap, 
  Database, 
  MessageCircle, 
  FileText, 
  CreditCard,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);

  const handleTemplateSelect = (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  };

  const handleInstallIntegration = (template: IntegrationTemplate) => {
    // This would typically open a setup wizard
    console.log('Installing integration:', template.name);
    alert(`Installing ${template.name} integration...`);
  };

  const handleAddIntegration = () => {
    setActiveTab('marketplace');
  };

  const handleEditIntegration = (integration: Integration) => {
    console.log('Editing integration:', integration.name);
  };

  const handleViewIntegration = (integration: Integration) => {
    console.log('Viewing integration:', integration.name);
  };

  const handleManageWorkflows = (integration: Integration) => {
    console.log('Managing workflows for:', integration.name);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Integrations Hub</h1>
          <p className="text-gray-600 mt-2">
            Discover, install, and manage third-party integrations to extend your platform capabilities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pro+ Feature
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Marketplace</p>
                <p className="text-sm text-gray-600">100+ integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Workflows</p>
                <p className="text-sm text-gray-600">Automated processes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-sm text-gray-600">Performance insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold">Monitoring</p>
                <p className="text-sm text-gray-600">Real-time alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Popular Integration Categories
          </CardTitle>
          <CardDescription>
            Connect with the tools and services your business already uses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Database className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="font-medium text-sm">Database</p>
              <p className="text-xs text-gray-500">Airtable, Notion</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <MessageCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium text-sm">Communication</p>
              <p className="text-xs text-gray-500">Slack, Discord</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <FileText className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="font-medium text-sm">Project Mgmt</p>
              <p className="text-xs text-gray-500">Notion, Asana</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <CreditCard className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="font-medium text-sm">E-commerce</p>
              <p className="text-xs text-gray-500">Stripe, Shopify</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <TrendingUp className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="font-medium text-sm">CRM</p>
              <p className="text-xs text-gray-500">HubSpot, Salesforce</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Settings className="h-8 w-8 mx-auto text-gray-600 mb-2" />
              <p className="font-medium text-sm">Automation</p>
              <p className="text-xs text-gray-500">Zapier, Make</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <IntegrationMarketplace
            onSelectTemplate={handleTemplateSelect}
            onInstallIntegration={handleInstallIntegration}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <IntegrationDashboard
            onAddIntegration={handleAddIntegration}
            onEditIntegration={handleEditIntegration}
            onViewIntegration={handleViewIntegration}
            onManageWorkflows={handleManageWorkflows}
          />
        </TabsContent>
      </Tabs>

      {/* Template Details Modal */}
      {showTemplateDetails && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedTemplate.color }}
                >
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateDetails(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedTemplate.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <CheckCircle className={`h-4 w-4 ${capability.supported ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-sm">{capability.name}</p>
                        <p className="text-xs text-gray-500">{capability.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Setup Steps</h3>
                <div className="space-y-2">
                  {selectedTemplate.setupSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.required && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Examples</h3>
                <div className="space-y-2">
                  {selectedTemplate.examples.map((example, index) => (
                    <div key={index} className="p-3 border rounded">
                      <p className="font-medium">{example.name}</p>
                      <p className="text-sm text-gray-600">{example.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Use case: {example.useCase}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => handleInstallIntegration(selectedTemplate)}
                >
                  Install Integration
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 