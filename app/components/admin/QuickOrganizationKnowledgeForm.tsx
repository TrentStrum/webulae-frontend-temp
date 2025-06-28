'use client';

import React, { useState } from 'react';
import { useOrganizationKnowledge, CreateOrganizationKnowledgeRequest } from '@/app/hooks/useOrganizationKnowledge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Plus, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface QuickOrganizationKnowledgeFormProps {
  organizationId: string;
  organizationName?: string;
}

const CATEGORIES = [
  'FAQ',
  'Service',
  'Policy',
  'Procedure',
  'Product',
  'General'
];

export const QuickOrganizationKnowledgeForm: React.FC<QuickOrganizationKnowledgeFormProps> = ({
  organizationId,
  organizationName = 'Organization'
}) => {
  const { create, isCreating } = useOrganizationKnowledge(organizationId);

  const [formData, setFormData] = useState<CreateOrganizationKnowledgeRequest>({
    category: 'FAQ',
    title: '',
    content: '',
    service_name: '',
    service_description: '',
    pricing_info: '',
    use_cases: ''
  });

  const [showServiceFields, setShowServiceFields] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    create(formData, {
      onSuccess: () => {
        // Reset form
        setFormData({
          category: 'FAQ',
          title: '',
          content: '',
          service_name: '',
          service_description: '',
          pricing_info: '',
          use_cases: ''
        });
        setShowServiceFields(false);
        toast.success('Knowledge added successfully!');
      }
    });
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setShowServiceFields(category === 'Service');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Quick Knowledge Addition
        </CardTitle>
        <CardDescription>
          Quickly add knowledge for {organizationName}'s chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for this knowledge"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter the knowledge content that your chatbot should know"
              rows={4}
              required
            />
          </div>

          {showServiceFields && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Service Information (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Service Name</label>
                  <Input
                    value={formData.service_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="Enter service name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pricing Information</label>
                  <Input
                    value={formData.pricing_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_info: e.target.value }))}
                    placeholder="Enter pricing details"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Service Description</label>
                <Textarea
                  value={formData.service_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
                  placeholder="Describe the service"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Use Cases</label>
                <Textarea
                  value={formData.use_cases}
                  onChange={(e) => setFormData(prev => ({ ...prev, use_cases: e.target.value }))}
                  placeholder="Describe when this service is useful"
                  rows={2}
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={isCreating} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Adding Knowledge...' : 'Add Knowledge'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 