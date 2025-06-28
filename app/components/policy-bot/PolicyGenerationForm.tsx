'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Loader2, FileText, Settings, CheckCircle } from 'lucide-react';
import { usePolicyBot } from '@/app/hooks/usePolicyBot';
import { PolicyTemplate, PolicyVariable, PolicyGenerationRequest } from '@/app/types/policyBot.types';

// Form validation schema
const policyGenerationSchema = z.object({
  template: z.string().min(1, 'Please select a template'),
  company_name: z.string().min(1, 'Company name is required'),
  tone: z.enum(['formal', 'professional', 'friendly']),
  language: z.enum(['en', 'es', 'fr']),
  includeLegalLanguage: z.boolean(),
  customVariables: z.record(z.any()).optional()
});

type PolicyGenerationFormData = z.infer<typeof policyGenerationSchema>;

interface PolicyGenerationFormProps {
  organizationId: string;
  onPolicyGenerated: (policy: any) => void;
}

export function PolicyGenerationForm({ organizationId, onPolicyGenerated }: PolicyGenerationFormProps) {
  const { templates, generatePolicy, isLoading } = usePolicyBot();
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [generatedPolicy, setGeneratedPolicy] = useState<any>(null);

  const form = useForm<PolicyGenerationFormData>({
    resolver: zodResolver(policyGenerationSchema),
    defaultValues: {
      template: '',
      company_name: '',
      tone: 'professional',
      language: 'en',
      includeLegalLanguage: false
    }
  });

  const watchedTemplate = form.watch('template');

  // Update selected template when form changes
  React.useEffect(() => {
    if (watchedTemplate && templates?.templates) {
      const template = templates.templates.find(t => t.id === watchedTemplate);
      setSelectedTemplate(template || null);
    }
  }, [watchedTemplate, templates]);

  const onSubmit = async (data: PolicyGenerationFormData) => {
    if (!selectedTemplate) return;

    try {
      // Build variables object
      const variables: Record<string, any> = {
        company_name: data.company_name,
        ...data.customVariables
      };

      // Add default values for missing variables
      selectedTemplate.variables.forEach(variable => {
        if (!variables[variable.name] && variable.defaultValue !== undefined) {
          variables[variable.name] = variable.defaultValue;
        }
      });

      const request: PolicyGenerationRequest = {
        template: selectedTemplate,
        organizationId,
        variables,
        tone: data.tone,
        language: data.language,
        includeLegalLanguage: data.includeLegalLanguage
      };

      const result = await generatePolicy.mutateAsync(request);
      setGeneratedPolicy(result);
      onPolicyGenerated(result);
    } catch (error) {
      console.error('Policy generation failed:', error);
    }
  };

  const renderVariableField = (variable: PolicyVariable) => {
    const fieldName = `customVariables.${variable.name}` as const;

    switch (variable.type) {
      case 'text':
        return (
          <FormField
            key={variable.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{variable.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={variable.placeholder}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>{variable.description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            key={variable.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{variable.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={variable.placeholder}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>{variable.description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={variable.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{variable.label}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {variable.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{variable.description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'boolean':
        return (
          <FormField
            key={variable.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{variable.label}</FormLabel>
                  <FormDescription>{variable.description}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Policy Document
          </CardTitle>
          <CardDescription>
            Create a professional policy document using our AI-powered templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Template Selection */}
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Template</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a policy template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates?.templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span>{template.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {template.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Template Details */}
              {selectedTemplate && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">{selectedTemplate.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedTemplate.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedTemplate.category}</Badge>
                        {selectedTemplate.legalLanguage && (
                          <Badge variant="outline">Legal Language</Badge>
                        )}
                        {selectedTemplate.requiresReview && (
                          <Badge variant="outline">Requires Review</Badge>
                        )}
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Sections:</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.sections.map((section) => (
                            <Badge key={section} variant="outline" className="text-xs">
                              {section.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Basic Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Basic Settings
                </h3>

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="includeLegalLanguage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Include Legal Disclaimer</FormLabel>
                        <FormDescription>
                          Add a legal disclaimer to the policy document
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Template Variables */}
              {selectedTemplate && selectedTemplate.variables.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Template Variables</h3>
                    <div className="space-y-4">
                      {selectedTemplate.variables
                        .filter(variable => variable.name !== 'company_name')
                        .map(renderVariableField)}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={generatePolicy.isPending}
              >
                {generatePolicy.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Policy...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Policy
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Generated Policy Preview */}
      {generatedPolicy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Policy Generated Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{generatedPolicy.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {generatedPolicy.metadata.wordCount} words • Generated {new Date(generatedPolicy.metadata.generatedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-2">
                {generatedPolicy.sections.map((section: any) => (
                  <div key={section.section} className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">{section.title}</h5>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {generatedPolicy.legalDisclaimer && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h5 className="font-medium mb-2">Legal Disclaimer</h5>
                  <p className="text-sm text-muted-foreground">
                    {generatedPolicy.legalDisclaimer}
                  </p>
                </div>
              )}

              {generatedPolicy.reviewNotes && generatedPolicy.reviewNotes.length > 0 && (
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <h5 className="font-medium mb-2">Review Notes</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {generatedPolicy.reviewNotes.map((note: string, index: number) => (
                      <li key={index}>• {note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 