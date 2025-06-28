'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { useToast } from '@/app/hooks/useToast';
import { IconRobot, IconRefresh, IconDeviceFloppy, IconSettings } from '@tabler/icons-react';
import { ChatbotSettings } from '@/app/types/chatbot.types';
import Link from 'next/link';

const SERVICE_CATEGORIES = [
  'AI & Automation',
  'Software Development',
  'Data & Analytics',
  'Cloud & Infrastructure',
  'Integration',
  'Consulting',
  'Security',
  'Training'
];

export default function ChatbotSettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings>({
    organization_id: 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8',
    allowed_services: [],
    upselling_enabled: true,
    company_knowledge_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadSettings = async () => {
    setLoading(true);
    try {
      // For now, we'll use a sample organization ID
      // In a real implementation, you'd want to select from available organizations
      const response = await fetch('/api/admin/chatbot-settings?organizationId=org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Use default settings if none exist
        setSettings({
          organization_id: 'org_2ynFsRZ9Mr8wGkGChLLe1vafoZ8',
          allowed_services: [],
          upselling_enabled: true,
          company_knowledge_enabled: true
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chatbot settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Ensure organization_id is set
      if (!settings.organization_id) {
        throw new Error('Organization ID is required');
      }

      const response = await fetch('/api/admin/chatbot-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Chatbot settings saved successfully'
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save chatbot settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (service: string) => {
    setSettings(prev => ({
      ...prev,
      allowed_services: prev.allowed_services.includes(service)
        ? prev.allowed_services.filter(s => s !== service)
        : [...prev.allowed_services, service]
    }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-nebula-gradient text-white p-6 rounded-xl shadow-space-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbot Settings</h1>
          <p className="text-white/90">
            Configure feature toggles and service permissions for the AI assistant
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            <IconRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <IconDeviceFloppy className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Notice about System Prompts */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <IconSettings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Bot Personality & Identity</h3>
              <p className="text-blue-700 text-sm mb-3">
                Bot name, personality, tone, and behavioral instructions are now managed through System Prompts for better organization and granular control.
              </p>
              <Link 
                href="/global-admin/system-prompts" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Manage System Prompts →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Organization Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconRobot className="h-5 w-5" />
              Organization Configuration
            </CardTitle>
            <CardDescription>
              Select the organization to configure settings for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization-id">Organization ID</Label>
              <Input
                id="organization-id"
                value={settings.organization_id}
                onChange={(e) => setSettings(prev => ({ ...prev, organization_id: e.target.value }))}
                placeholder="Organization ID"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Configuration</CardTitle>
            <CardDescription>
              Enable or disable specific chatbot features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Upselling Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the chatbot to suggest relevant services when appropriate
                </p>
              </div>
              <Switch
                checked={settings.upselling_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, upselling_enabled: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Company Knowledge Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the chatbot to access and reference company knowledge base
                </p>
              </div>
              <Switch
                checked={settings.company_knowledge_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, company_knowledge_enabled: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Allowed Services */}
        <Card>
          <CardHeader>
            <CardTitle>Allowed Services</CardTitle>
            <CardDescription>
              Select which service categories the chatbot can suggest during upselling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SERVICE_CATEGORIES.map((service) => (
                <div
                  key={service}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    settings.allowed_services.includes(service)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleService(service)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{service}</span>
                    {settings.allowed_services.includes(service) && (
                      <Badge variant="secondary" className="text-xs">
                        Allowed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Settings Preview</CardTitle>
            <CardDescription>
              Summary of current chatbot configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Organization ID:</span> {settings.organization_id}
              </div>
              <div>
                <span className="font-medium">Upselling:</span> {settings.upselling_enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <span className="font-medium">Company Knowledge:</span> {settings.company_knowledge_enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <span className="font-medium">Allowed Services:</span> {settings.allowed_services.length} selected
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 