'use client';

import React, { useState } from 'react';
import { useCompanyKnowledge } from '@/app/hooks/useCompanyKnowledge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, BookOpen, HelpCircle, Settings } from 'lucide-react';

export function QuickKnowledgeForm() {
  const { useAddFAQ, useAddServiceKnowledge, useAddCompanyKnowledge } = useCompanyKnowledge();
  const addFAQ = useAddFAQ();
  const addService = useAddServiceKnowledge();
  const addKnowledge = useAddCompanyKnowledge();

  const [activeTab, setActiveTab] = useState('faq');

  // FAQ form state
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Service form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePricing, setServicePricing] = useState('');
  const [serviceUseCases, setServiceUseCases] = useState('');

  // General knowledge form state
  const [knowledgeCategory, setKnowledgeCategory] = useState('');
  const [knowledgeTitle, setKnowledgeTitle] = useState('');
  const [knowledgeContent, setKnowledgeContent] = useState('');

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    await addFAQ.mutateAsync({
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
    });

    // Reset form
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceDescription.trim()) return;

    await addService.mutateAsync({
      serviceName: serviceName.trim(),
      description: serviceDescription.trim(),
      pricing: servicePricing.trim() || undefined,
      useCases: serviceUseCases.trim() || undefined,
    });

    // Reset form
    setServiceName('');
    setServiceDescription('');
    setServicePricing('');
    setServiceUseCases('');
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowledgeCategory.trim() || !knowledgeTitle.trim() || !knowledgeContent.trim()) return;

    await addKnowledge.mutateAsync({
      category: knowledgeCategory.trim(),
      title: knowledgeTitle.trim(),
      content: knowledgeContent.trim(),
    });

    // Reset form
    setKnowledgeCategory('');
    setKnowledgeTitle('');
    setKnowledgeContent('');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Knowledge Addition
        </CardTitle>
        <CardDescription>
          Quickly add FAQs, services, or general knowledge to your company knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Service
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <form onSubmit={handleAddFAQ} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faq-question">Question</Label>
                <Input
                  id="faq-question"
                  placeholder="What is your most common question?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-answer">Answer</Label>
                <Textarea
                  id="faq-answer"
                  placeholder="Provide a clear, helpful answer..."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={addFAQ.isPending || !faqQuestion.trim() || !faqAnswer.trim()}
                className="w-full"
              >
                {addFAQ.isPending ? 'Adding FAQ...' : 'Add FAQ'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="service" className="space-y-4">
            <form onSubmit={handleAddService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  placeholder="e.g., AI Document Processing"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  placeholder="Describe what this service does..."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-pricing">Pricing (Optional)</Label>
                <Input
                  id="service-pricing"
                  placeholder="e.g., Starting at $2,500"
                  value={servicePricing}
                  onChange={(e) => setServicePricing(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-use-cases">Use Cases (Optional)</Label>
                <Textarea
                  id="service-use-cases"
                  placeholder="e.g., Invoice processing, contract analysis..."
                  value={serviceUseCases}
                  onChange={(e) => setServiceUseCases(e.target.value)}
                  rows={2}
                />
              </div>
              <Button 
                type="submit" 
                disabled={addService.isPending || !serviceName.trim() || !serviceDescription.trim()}
                className="w-full"
              >
                {addService.isPending ? 'Adding Service...' : 'Add Service'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <form onSubmit={handleAddKnowledge} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="knowledge-category">Category</Label>
                <Input
                  id="knowledge-category"
                  placeholder="e.g., Best Practices, Policies, Procedures"
                  value={knowledgeCategory}
                  onChange={(e) => setKnowledgeCategory(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="knowledge-title">Title</Label>
                <Input
                  id="knowledge-title"
                  placeholder="Brief title for this knowledge"
                  value={knowledgeTitle}
                  onChange={(e) => setKnowledgeTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="knowledge-content">Content</Label>
                <Textarea
                  id="knowledge-content"
                  placeholder="Detailed content, procedures, or information..."
                  value={knowledgeContent}
                  onChange={(e) => setKnowledgeContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={addKnowledge.isPending || !knowledgeCategory.trim() || !knowledgeTitle.trim() || !knowledgeContent.trim()}
                className="w-full"
              >
                {addKnowledge.isPending ? 'Adding Knowledge...' : 'Add Knowledge'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 