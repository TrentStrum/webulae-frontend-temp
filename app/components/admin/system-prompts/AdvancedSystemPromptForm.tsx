'use client';

import React, { useState, useEffect } from 'react';
import { 
  SystemPrompt, 
  CreateSystemPromptRequest, 
  UpdateSystemPromptRequest, 
  PromptVariable, 
  PromptCondition,
  ADVANCED_SYSTEM_PROMPT_CATEGORIES 
} from '@/app/types/systemPrompt.types';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { 
  Info, 
  Plus, 
  Trash2, 
  Variable, 
  Code, 
  Settings,
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdvancedPromptService, PromptContext } from '@/app/lib/advancedPromptService';

interface AdvancedSystemPromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSystemPromptRequest | UpdateSystemPromptRequest) => void;
  initialData?: SystemPrompt;
  title: string;
  description: string;
  submitLabel: string;
  isLoading?: boolean;
  hasActivePrompt?: boolean;
}

export const AdvancedSystemPromptForm: React.FC<AdvancedSystemPromptFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  submitLabel,
  isLoading = false,
  hasActivePrompt = false,
}) => {
  const [formData, setFormData] = useState<CreateSystemPromptRequest>({
    prompt_name: '',
    content: '',
    category: 'General',
    priority: 1,
    is_active: true,
    variables: [],
    conditions: [],
    template_type: 'static',
    tags: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [previewContext, setPreviewContext] = useState<PromptContext>({
    user_id: 'test_user',
    organization_id: 'test_org',
    user_role: 'org_member',
    user_permissions: ['read', 'write'],
    current_time: new Date().toISOString(),
    user_preferences: {},
    conversation_history: [],
    system_settings: {}
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        prompt_name: initialData.prompt_name,
        content: initialData.content,
        category: initialData.category,
        priority: initialData.priority,
        is_active: initialData.is_active,
        variables: initialData.variables || [],
        conditions: initialData.conditions || [],
        template_type: initialData.template_type || 'static',
        tags: initialData.tags || []
      });
    } else {
      setFormData({
        prompt_name: '',
        content: '',
        category: 'General',
        priority: 1,
        is_active: true,
        variables: [],
        conditions: [],
        template_type: 'static',
        tags: []
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt_name.trim() || !formData.content.trim()) {
      return;
    }
    onSubmit(formData);
  };

  const addVariable = () => {
    const newVariable: PromptVariable = {
      name: '',
      type: 'string',
      description: '',
      required: false
    };
    setFormData(prev => ({
      ...prev,
      variables: [...(prev.variables || []), newVariable]
    }));
  };

  const updateVariable = (index: number, field: keyof PromptVariable, value: any) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables?.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ) || []
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables?.filter((_, i) => i !== index) || []
    }));
  };

  const addCondition = () => {
    const newCondition: PromptCondition = {
      field: '',
      operator: 'equals',
      value: ''
    };
    setFormData(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition]
    }));
  };

  const updateCondition = (index: number, field: keyof PromptCondition, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      ) || []
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const generatePreview = () => {
    const mockPrompt: SystemPrompt = {
      id: 'preview',
      prompt_name: formData.prompt_name,
      content: formData.content,
      category: formData.category,
      priority: formData.priority || 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      variables: formData.variables,
      conditions: formData.conditions,
      template_type: formData.template_type
    };

    return AdvancedPromptService.buildDynamicPrompt([mockPrompt], previewContext);
  };

  const showActiveWarning = formData.is_active && hasActivePrompt && !initialData?.is_active;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prompt Name</label>
                <Input
                  value={formData.prompt_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt_name: e.target.value }))}
                  placeholder="Enter prompt name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADVANCED_SYSTEM_PROMPT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your system prompt content..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {{variable_name}} for variables, e.g., "Hello {{user_name}}!"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Template Type</label>
              <Select value={formData.template_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, template_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="dynamic">Dynamic</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showActiveWarning && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This will replace the currently active prompt. Only one prompt can be active at a time.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="variables" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Variables</h3>
              <Button type="button" onClick={addVariable} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>

            {formData.variables?.map((variable, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm">Variable {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={variable.name}
                        onChange={(e) => updateVariable(index, 'name', e.target.value)}
                        placeholder="variable_name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={variable.type} onValueChange={(value: any) => updateVariable(index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={variable.description}
                      onChange={(e) => updateVariable(index, 'description', e.target.value)}
                      placeholder="What this variable represents"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={variable.required}
                      onCheckedChange={(checked) => updateVariable(index, 'required', checked)}
                    />
                    <label className="text-sm font-medium">Required</label>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeVariable(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}

            {(!formData.variables || formData.variables.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Variable className="h-12 w-12 mx-auto mb-4" />
                <p>No variables defined. Add variables to make your prompt dynamic.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Conditions</h3>
              <Button type="button" onClick={addCondition} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>

            {formData.conditions?.map((condition, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm">Condition {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium">Field</label>
                      <Input
                        value={condition.field}
                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                        placeholder="user_role"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Operator</label>
                      <Select value={condition.operator} onValueChange={(value: any) => updateCondition(index, 'operator', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="not_contains">Not Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="exists">Exists</SelectItem>
                          <SelectItem value="not_exists">Not Exists</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Value</label>
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="org_admin"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}

            {(!formData.conditions || formData.conditions.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-4" />
                <p>No conditions defined. Add conditions to make your prompt conditional.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Preview</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Processed Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{generatePreview()}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <label className="text-sm font-medium">Test Context (JSON)</label>
              <Textarea
                value={JSON.stringify(previewContext, null, 2)}
                onChange={(e) => {
                  try {
                    setPreviewContext(JSON.parse(e.target.value));
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={8}
                placeholder="Enter test context as JSON..."
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addTag(input.value);
                      input.value = '';
                    }
                  }}
                />
                <Button type="button" onClick={() => {
                  const input = document.querySelector('input[placeholder="Add tag..."]') as HTMLInputElement;
                  if (input?.value) {
                    addTag(input.value);
                    input.value = '';
                  }
                }}>
                  Add
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Usage Notes</label>
              <Textarea
                placeholder="Add notes about when and how to use this prompt..."
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 