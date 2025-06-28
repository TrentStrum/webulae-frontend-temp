'use client';

import React, { useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { FileText, Plus, Settings, History, Download } from 'lucide-react';
import { PolicyGenerationForm } from '@/app/components/policy-bot/PolicyGenerationForm';
import { usePolicyDocuments } from '@/app/hooks/usePolicyBot';
import { PolicyDocument } from '@/app/types/policyBot.types';

export default function PolicyBotPage() {
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedPolicy, setGeneratedPolicy] = useState<any>(null);

  const { data: policyDocuments, isLoading: documentsLoading } = usePolicyDocuments(
    organization?.id || ''
  );

  const handlePolicyGenerated = (policy: any) => {
    setGeneratedPolicy(policy);
    setActiveTab('history');
  };

  const downloadPolicy = (policy: PolicyDocument) => {
    // Create a formatted document for download
    const content = `
${policy.title}

${policy.sections.map(section => `
${section.title}
${section.content}
`).join('\n')}

${policy.legalDisclaimer ? `
Legal Disclaimer:
${policy.legalDisclaimer}
` : ''}

Generated: ${new Date(policy.generatedAt).toLocaleDateString()}
Version: ${policy.version}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      review: { variant: 'outline' as const, label: 'In Review' },
      approved: { variant: 'default' as const, label: 'Approved' },
      archived: { variant: 'destructive' as const, label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Policy Bot
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate professional policy documents using AI-powered templates
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Pro+ Feature
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate Policy
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Policy History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Generate Policy Tab */}
        <TabsContent value="generate" className="space-y-6">
          {organization?.id ? (
            <PolicyGenerationForm
              organizationId={organization.id}
              onPolicyGenerated={handlePolicyGenerated}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">Please select an organization to continue.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Policy History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Policy Documents
              </CardTitle>
              <CardDescription>
                View and manage your generated policy documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="flex items-center justify-center p-6">
                  <p className="text-muted-foreground">Loading policy documents...</p>
                </div>
              ) : policyDocuments && policyDocuments.length > 0 ? (
                <div className="space-y-4">
                  {policyDocuments.map((policy) => (
                    <div
                      key={policy.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{policy.title}</h3>
                            {getStatusBadge(policy.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Template: {policy.template.name} • {policy.metadata.wordCount} words
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Generated: {new Date(policy.generatedAt).toLocaleDateString()} • 
                            Version: {policy.version}
                          </p>
                          {policy.reviewNotes && policy.reviewNotes.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-yellow-600">Review Notes:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {policy.reviewNotes.map((note, index) => (
                                  <li key={index}>• {note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPolicy(policy)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Policy Documents</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't generated any policy documents yet.
                  </p>
                  <Button onClick={() => setActiveTab('generate')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Your First Policy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Policy Bot Settings
              </CardTitle>
              <CardDescription>
                Configure default settings for policy generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Default Tone</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional (recommended for business policies)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Default Language</h4>
                    <p className="text-sm text-muted-foreground">
                      English (en)
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Legal Language</h4>
                  <p className="text-sm text-muted-foreground">
                    Legal disclaimers are included by default for templates that require them.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Review Process</h4>
                  <p className="text-sm text-muted-foreground">
                    All generated policies are marked for review by default to ensure accuracy and compliance.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Available Templates</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">PTO Policy</Badge>
                    <Badge variant="outline">Equipment Checkout</Badge>
                    <Badge variant="outline">Employee Onboarding</Badge>
                    <Badge variant="outline">More coming soon...</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {generatedPolicy && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800">
                  Policy Generated Successfully!
                </h3>
                <p className="text-sm text-green-600">
                  Your policy "{generatedPolicy.title}" has been created.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadPolicy(generatedPolicy)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={() => setActiveTab('history')}
                >
                  View All Policies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 