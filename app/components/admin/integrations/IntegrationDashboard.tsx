'use client';

import React, { useState } from 'react';
import { useIntegrations, useWorkflows, useEvents, useIntegrationManagement } from '@/app/hooks/useIntegrations';
import { Integration, IntegrationWorkflow, IntegrationEvent } from '@/app/types/integrations.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Plus, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  MessageCircle,
  FileText,
  CreditCard,
  Settings as SettingsIcon,
  Zap,
  TrendingUp,
  BarChart3,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface IntegrationDashboardProps {
  onAddIntegration?: () => void;
  onEditIntegration?: (integration: Integration) => void;
  onViewIntegration?: (integration: Integration) => void;
  onManageWorkflows?: (integration: Integration) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
  syncing: 'bg-yellow-100 text-yellow-800',
  disconnected: 'bg-gray-100 text-gray-800'
};

const providerIcons = {
  airtable: <Database className="h-4 w-4" />,
  notion: <FileText className="h-4 w-4" />,
  slack: <MessageCircle className="h-4 w-4" />,
  discord: <MessageCircle className="h-4 w-4" />,
  zapier: <Zap className="h-4 w-4" />,
  make: <SettingsIcon className="h-4 w-4" />,
  hubspot: <TrendingUp className="h-4 w-4" />,
  salesforce: <TrendingUp className="h-4 w-4" />,
  mailchimp: <MessageCircle className="h-4 w-4" />,
  stripe: <CreditCard className="h-4 w-4" />,
  shopify: <CreditCard className="h-4 w-4" />,
  quickbooks: <CreditCard className="h-4 w-4" />,
  bamboo_hr: <SettingsIcon className="h-4 w-4" />,
  google_workspace: <SettingsIcon className="h-4 w-4" />,
  microsoft_365: <SettingsIcon className="h-4 w-4" />,
  custom: <SettingsIcon className="h-4 w-4" />
};

export function IntegrationDashboard({
  onAddIntegration,
  onEditIntegration,
  onViewIntegration,
  onManageWorkflows
}: IntegrationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const { data: integrationsData, isLoading: integrationsLoading } = useIntegrations();
  const { data: workflowsData, isLoading: workflowsLoading } = useWorkflows();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  
  const { deleteIntegration, testIntegration, isLoading, error } = useIntegrationManagement();

  const integrations = integrationsData?.data?.integrations || [];
  const workflows = workflowsData?.data || [];
  const events = eventsData?.data || [];

  // Calculate dashboard metrics
  const metrics = {
    totalIntegrations: integrations.length,
    activeIntegrations: integrations.filter(i => i.status === 'active').length,
    errorIntegrations: integrations.filter(i => i.status === 'error').length,
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.status === 'active').length,
    recentEvents: events.filter(e => !e.resolved).length,
    criticalEvents: events.filter(e => e.severity === 'critical' && !e.resolved).length
  };

  const handleDeleteIntegration = async (integration: Integration) => {
    if (confirm(`Are you sure you want to delete ${integration.name}?`)) {
      await deleteIntegration.mutateAsync(integration.id);
    }
  };

  const handleTestIntegration = async (integration: Integration) => {
    await testIntegration.mutateAsync(integration.id);
  };

  const renderIntegrationCard = (integration: Integration) => (
    <Card key={integration.id} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              {providerIcons[integration.provider as keyof typeof providerIcons]}
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="text-sm">
                {integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}
              </CardDescription>
            </div>
          </div>
          <Badge className={statusColors[integration.status]}>
            {integration.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Type</span>
            <span className="font-medium">{integration.type.replace('_', ' ')}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Last Sync</span>
            <span className="font-medium">
              {integration.lastSyncAt 
                ? new Date(integration.lastSyncAt).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>

          {integration.lastErrorAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Last Error</span>
              <span className="text-red-600 font-medium">
                {new Date(integration.lastErrorAt).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewIntegration?.(integration)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEditIntegration?.(integration)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestIntegration(integration)}
              disabled={testIntegration.isPending}
            >
              <Activity className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteIntegration(integration)}
              disabled={deleteIntegration.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkflowCard = (workflow: IntegrationWorkflow) => (
    <Card key={workflow.id} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{workflow.name}</CardTitle>
            <CardDescription className="text-sm">{workflow.description}</CardDescription>
          </div>
          <Badge className={statusColors[workflow.status]}>
            {workflow.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Steps</span>
            <span className="font-medium">{workflow.steps.length}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Executions</span>
            <span className="font-medium">{workflow.executionCount}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Success Rate</span>
            <span className="font-medium">
              {workflow.executionCount > 0 
                ? `${Math.round((workflow.successCount / workflow.executionCount) * 100)}%`
                : '0%'
              }
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onManageWorkflows?.(integrations.find(i => i.id === workflow.id)!)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={workflow.status === 'running'}
            >
              {workflow.status === 'active' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEventCard = (event: IntegrationEvent) => (
    <Card key={event.id} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              event.severity === 'critical' ? 'bg-red-100' :
              event.severity === 'high' ? 'bg-orange-100' :
              event.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              {event.severity === 'critical' ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : event.severity === 'high' ? (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              ) : event.severity === 'medium' ? (
                <Clock className="h-4 w-4 text-yellow-600" />
              ) : (
                <Activity className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{event.title}</CardTitle>
              <CardDescription className="text-sm">{event.description}</CardDescription>
            </div>
          </div>
          <Badge className={
            event.severity === 'critical' ? 'bg-red-100 text-red-800' :
            event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
            event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
          }>
            {event.severity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-medium">
              {new Date(event.timestamp).toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium ${event.resolved ? 'text-green-600' : 'text-red-600'}`}>
              {event.resolved ? 'Resolved' : 'Open'}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={event.resolved}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (integrationsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Dashboard</h2>
          <p className="text-gray-600">Manage your third-party integrations and workflows</p>
        </div>
        <Button onClick={onAddIntegration}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold">{metrics.totalIntegrations}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold">{metrics.activeWorkflows}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Events</p>
                <p className="text-2xl font-bold">{metrics.recentEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold">{metrics.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Recent Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations.slice(0, 3).map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          {providerIcons[integration.provider as keyof typeof providerIcons]}
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-gray-500">{integration.provider}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[integration.status]}>
                        {integration.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {event.severity === 'critical' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        event.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Integrations</h3>
            <div className="flex gap-2">
              <Badge variant="outline">{metrics.activeIntegrations} Active</Badge>
              <Badge variant="outline" className="text-red-600">{metrics.errorIntegrations} Errors</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(renderIntegrationCard)}
          </div>

          {integrations.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first integration
              </p>
              <Button onClick={onAddIntegration}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workflows</h3>
            <div className="flex gap-2">
              <Badge variant="outline">{metrics.activeWorkflows} Active</Badge>
              <Badge variant="outline">{metrics.totalWorkflows} Total</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map(renderWorkflowCard)}
          </div>

          {workflows.length === 0 && (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
              <p className="text-gray-600 mb-4">
                Create workflows to automate your integration processes
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Events & Alerts</h3>
            <div className="flex gap-2">
              <Badge variant="outline">{metrics.recentEvents} Recent</Badge>
              <Badge variant="outline" className="text-red-600">{metrics.criticalEvents} Critical</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(renderEventCard)}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All clear!</h3>
              <p className="text-gray-600">
                No events or alerts at the moment
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 