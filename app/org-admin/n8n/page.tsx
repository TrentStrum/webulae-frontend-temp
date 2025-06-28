'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useToast } from '@/app/hooks/useToast';
import { IconSettings, IconRobot, IconBolt, IconTestPipe, IconPlus, IconTrash } from '@tabler/icons-react';
import { N8nOrganizationConfig, N8nChatTrigger } from '@/app/types/n8n.types';

export default function N8nConfigurationPage() {
  const [config, setConfig] = useState<N8nOrganizationConfig | null>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<N8nChatTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // Form states
  const [n8nUrl, setN8nUrl] = useState('');
  const [n8nApiKey, setN8nApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [maxExecutions, setMaxExecutions] = useState(60);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      
      // Load n8n configuration
      const configResponse = await fetch('/api/org-admin/n8n/config');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfig(configData);
        setN8nUrl(configData.n8n_base_url || '');
        setN8nApiKey(configData.n8n_api_key || '');
        setWebhookSecret(configData.webhook_secret || '');
        setMaxExecutions(configData.max_executions_per_minute || 60);
      }

      // Load workflows
      const workflowsResponse = await fetch('/api/org-admin/n8n/workflows');
      if (workflowsResponse.ok) {
        const workflowsData = await workflowsResponse.json();
        setWorkflows(workflowsData);
      }

      // Load chat triggers
      const triggersResponse = await fetch('/api/org-admin/n8n/triggers');
      if (triggersResponse.ok) {
        const triggersData = await triggersResponse.json();
        setTriggers(triggersData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load n8n configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      const response = await fetch('/api/org-admin/n8n/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n8n_base_url: n8nUrl,
          n8n_api_key: n8nApiKey,
          webhook_secret: webhookSecret,
          max_executions_per_minute: maxExecutions,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'n8n configuration saved successfully',
        });
        await loadConfiguration();
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save n8n configuration',
        variant: 'destructive',
      });
    }
  };

  const testConnection = async () => {
    try {
      setIsTesting(true);
      const response = await fetch('/api/org-admin/n8n/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n8n_base_url: n8nUrl,
          n8n_api_key: n8nApiKey,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'n8n connection test successful',
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'n8n connection test failed',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const addChatTrigger = async (trigger: Omit<N8nChatTrigger, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/org-admin/n8n/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trigger),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Chat trigger added successfully',
        });
        await loadConfiguration();
      } else {
        throw new Error('Failed to add trigger');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add chat trigger',
        variant: 'destructive',
      });
    }
  };

  const deleteChatTrigger = async (triggerId: string) => {
    try {
      const response = await fetch(`/api/org-admin/n8n/triggers/${triggerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Chat trigger deleted successfully',
        });
        await loadConfiguration();
      } else {
        throw new Error('Failed to delete trigger');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete chat trigger',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">n8n Workflow Integration</h1>
          <p className="text-muted-foreground">
            Configure and manage n8n workflows for your organization
          </p>
        </div>
        <IconBolt className="h-8 w-8 text-primary" />
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="triggers">Chat Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-5 w-5" />
                n8n Connection Settings
              </CardTitle>
              <CardDescription>
                Configure your n8n instance connection details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="n8n-url">n8n Base URL</Label>
                  <Input
                    id="n8n-url"
                    type="url"
                    placeholder="https://your-n8n-instance.com"
                    value={n8nUrl}
                    onChange={(e) => setN8nUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n8n-api-key">API Key</Label>
                  <Input
                    id="n8n-api-key"
                    type="password"
                    placeholder="Enter your n8n API key"
                    value={n8nApiKey}
                    onChange={(e) => setN8nApiKey(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                  <Input
                    id="webhook-secret"
                    type="password"
                    placeholder="Webhook secret for security"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-executions">Max Executions per Minute</Label>
                  <Input
                    id="max-executions"
                    type="number"
                    min="1"
                    max="1000"
                    value={maxExecutions}
                    onChange={(e) => setMaxExecutions(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveConfiguration}>
                  <IconSettings className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={testConnection} disabled={isTesting}>
                  <IconTestPipe className="h-4 w-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBolt className="h-5 w-5" />
                Available Workflows
              </CardTitle>
              <CardDescription>
                Workflows available in your n8n instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconBolt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workflows found. Make sure your n8n connection is configured correctly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={workflow.active ? 'default' : 'secondary'}>
                            {workflow.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {workflow.tags?.map((tag: string) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm">
                          Configure Permissions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconRobot className="h-5 w-5" />
                Chat Triggers
              </CardTitle>
              <CardDescription>
                Configure when workflows should be triggered from chat messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Active Triggers</h3>
                <Button onClick={() => {/* TODO: Open add trigger modal */}}>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Trigger
                </Button>
              </div>

              {triggers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconRobot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No chat triggers configured yet.</p>
                  <Button className="mt-4" onClick={() => {/* TODO: Open add trigger modal */}}>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Create Your First Trigger
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {triggers.map((trigger) => (
                    <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{trigger.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          Workflow: {workflows.find(w => w.id === trigger.workflowId)?.name || 'Unknown'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={trigger.active ? 'default' : 'secondary'}>
                            {trigger.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {trigger.requiresConfirmation && (
                            <Badge variant="outline">Requires Confirmation</Badge>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Trigger phrases:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {trigger.triggerPhrases.map((phrase, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                "{phrase}"
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteChatTrigger(trigger.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 