'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Progress } from '@/app/components/ui/progress';
import { IconCheck, IconArrowRight, IconArrowLeft, IconDatabase, IconKey, IconTable, IconBrain } from '@tabler/icons-react';
import { useAirtableConnectionTest, useAirtableBases, useCreateAirtableConfig } from '@/app/hooks/useAirtable';
import { AirtableBase, SetupWizardStep, SetupWizardData } from '@/app/types/airtable.types';

interface AirtableSetupWizardProps {
  onComplete: (configId: string) => void;
  onCancel: () => void;
}

const STEPS: SetupWizardStep[] = [
  {
    id: 'api-key',
    title: 'Connect to Airtable',
    description: 'Enter your Airtable API key to connect your account',
    component: 'ApiKeyStep',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'select-base',
    title: 'Select Base',
    description: 'Choose which Airtable base to connect',
    component: 'SelectBaseStep',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'configure',
    title: 'Configure Integration',
    description: 'Set up analysis preferences and data mapping',
    component: 'ConfigureStep',
    isCompleted: false,
    isRequired: false
  }
];

export function AirtableSetupWizard({ onComplete, onCancel }: AirtableSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<SetupWizardData>({});
  const [steps, setSteps] = useState(STEPS);

  const connectionTest = useAirtableConnectionTest(wizardData.apiKey || '', currentStep === 0);
  const basesQuery = useAirtableBases(wizardData.apiKey || '', currentStep === 1);
  const createConfig = useCreateAirtableConfig();

  const updateWizardData = (updates: Partial<SetupWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const markStepComplete = (stepIndex: number, completed: boolean = true) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, isCompleted: completed } : step
    ));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!wizardData.apiKey || !wizardData.selectedBase) {
      return;
    }

    try {
      const result = await createConfig.mutateAsync({
        apiKey: wizardData.apiKey,
        baseId: wizardData.selectedBase.id,
        baseName: wizardData.selectedBase.name
      });

      if (result.success && result.data) {
        onComplete(result.data.id);
      }
    } catch (error) {
      console.error('Error creating Airtable config:', error);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabase className="h-5 w-5" />
            Airtable Integration Setup
          </CardTitle>
          <CardDescription>
            Connect your Airtable account to enable AI-powered data analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index < currentStep 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : index === currentStep 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-muted border-muted-foreground text-muted-foreground'
                }`}>
                  {index < currentStep ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 0 && (
              <ApiKeyStep
                apiKey={wizardData.apiKey || ''}
                onApiKeyChange={(apiKey) => updateWizardData({ apiKey })}
                connectionTest={connectionTest}
                onValid={() => {
                  markStepComplete(0, true);
                  nextStep();
                }}
              />
            )}

            {currentStep === 1 && (
              <SelectBaseStep
                apiKey={wizardData.apiKey || ''}
                basesQuery={basesQuery}
                selectedBase={wizardData.selectedBase}
                onBaseSelect={(base) => {
                  updateWizardData({ selectedBase: base });
                  markStepComplete(1, true);
                  nextStep();
                }}
              />
            )}

            {currentStep === 2 && (
              <ConfigureStep
                data={wizardData}
                onDataChange={updateWizardData}
                onComplete={handleComplete}
                isLoading={createConfig.isPending}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  disabled={createConfig.isPending || !wizardData.selectedBase}
                >
                  {createConfig.isPending ? 'Setting up...' : 'Complete Setup'}
                  <IconCheck className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!steps[currentStep].isCompleted}
                >
                  Next
                  <IconArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step Components
interface ApiKeyStepProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  connectionTest: any;
  onValid: () => void;
}

function ApiKeyStep({ apiKey, onApiKeyChange, connectionTest, onValid }: ApiKeyStepProps) {
  const [showKey, setShowKey] = useState(false);

  React.useEffect(() => {
    if (connectionTest.data?.success && connectionTest.data?.data?.isValid) {
      onValid();
    }
  }, [connectionTest.data, onValid]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">Airtable API Key</Label>
        <div className="relative">
          <Input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter your Airtable API key"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? 'Hide' : 'Show'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          You can find your API key in your{' '}
          <a href="https://airtable.com/account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Airtable account settings
          </a>
        </p>
      </div>

      {apiKey && (
        <div className="space-y-2">
          {connectionTest.isLoading && (
            <Alert>
              <AlertDescription>Testing connection to Airtable...</AlertDescription>
            </Alert>
          )}

          {connectionTest.data && (
            <Alert className={connectionTest.data.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                {connectionTest.data.success ? (
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">
                      Connection successful! Found base: {connectionTest.data.data?.baseName}
                    </span>
                  </div>
                ) : (
                  <span className="text-red-800">
                    Connection failed: {connectionTest.data.error}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

interface SelectBaseStepProps {
  apiKey: string;
  basesQuery: any;
  selectedBase: AirtableBase | undefined;
  onBaseSelect: (base: AirtableBase) => void;
}

function SelectBaseStep({ apiKey, basesQuery, selectedBase, onBaseSelect }: SelectBaseStepProps) {
  if (!apiKey) {
    return (
      <Alert>
        <AlertDescription>Please enter your API key in the previous step.</AlertDescription>
      </Alert>
    );
  }

  if (basesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (basesQuery.error || !basesQuery.data?.success) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription>
          Failed to load Airtable bases: {basesQuery.data?.error || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  const bases = basesQuery.data?.data || [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Airtable Base</Label>
        <p className="text-sm text-muted-foreground">
          Choose which base you'd like to connect for data analysis
        </p>
      </div>

      <div className="space-y-2">
        {bases.map((base: AirtableBase) => (
          <Card
            key={base.id}
            className={`cursor-pointer transition-colors ${
              selectedBase?.id === base.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
            }`}
            onClick={() => onBaseSelect(base)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{base.name}</h4>
                  {base.description && (
                    <p className="text-sm text-muted-foreground">{base.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {base.tables?.length || 0} tables
                    </Badge>
                  </div>
                </div>
                {selectedBase?.id === base.id && (
                  <IconCheck className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bases.length === 0 && (
        <Alert>
          <AlertDescription>
            No bases found in your Airtable account. Please create a base first.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface ConfigureStepProps {
  data: SetupWizardData;
  onDataChange: (updates: Partial<SetupWizardData>) => void;
  onComplete: () => void;
  isLoading: boolean;
}

function ConfigureStep({ data, onDataChange, onComplete, isLoading }: ConfigureStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Configuration Summary</h3>
          <p className="text-sm text-muted-foreground">
            Review your settings before completing the setup
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Base:</span>
                <span className="text-sm">{data.selectedBase?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tables:</span>
                <span className="text-sm">{data.selectedBase?.tables?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="default">Ready to connect</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <Label htmlFor="refresh-interval">Data Refresh Interval (minutes)</Label>
            <Select
              value={data.analysisPreferences?.refreshInterval?.toString() || '60'}
              onValueChange={(value) => onDataChange({
                analysisPreferences: {
                  ...data.analysisPreferences,
                  refreshInterval: parseInt(value)
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="1440">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="max-records">Maximum Records per Query</Label>
            <Select
              value={data.analysisPreferences?.maxRecordsPerQuery?.toString() || '1000'}
              onValueChange={(value) => onDataChange({
                analysisPreferences: {
                  ...data.analysisPreferences,
                  maxRecordsPerQuery: parseInt(value)
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1,000</SelectItem>
                <SelectItem value="5000">5,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Ready to connect!</strong> Your Airtable integration will be configured with these settings.
          You can modify these preferences later in the settings.
        </AlertDescription>
      </Alert>
    </div>
  );
} 