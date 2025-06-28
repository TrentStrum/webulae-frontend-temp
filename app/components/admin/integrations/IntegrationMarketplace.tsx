'use client';

import React, { useState, useMemo } from 'react';
import { useIntegrationTemplates, useMarketplaceSearch } from '@/app/hooks/useIntegrations';
import { IntegrationTemplate, IntegrationProvider, IntegrationType } from '@/app/types/integrations.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Zap, 
  Database, 
  MessageCircle, 
  FileText, 
  CreditCard,
  Settings,
  Plus,
  ExternalLink
} from 'lucide-react';

interface IntegrationMarketplaceProps {
  onSelectTemplate?: (template: IntegrationTemplate) => void;
  onInstallIntegration?: (template: IntegrationTemplate) => void;
}

const providerIcons: Record<IntegrationProvider, React.ReactNode> = {
  airtable: <Database className="h-4 w-4" />,
  notion: <FileText className="h-4 w-4" />,
  slack: <MessageCircle className="h-4 w-4" />,
  discord: <MessageCircle className="h-4 w-4" />,
  zapier: <Zap className="h-4 w-4" />,
  make: <Settings className="h-4 w-4" />,
  hubspot: <TrendingUp className="h-4 w-4" />,
  salesforce: <TrendingUp className="h-4 w-4" />,
  mailchimp: <MessageCircle className="h-4 w-4" />,
  stripe: <CreditCard className="h-4 w-4" />,
  shopify: <CreditCard className="h-4 w-4" />,
  quickbooks: <CreditCard className="h-4 w-4" />,
  bamboo_hr: <Settings className="h-4 w-4" />,
  google_workspace: <Settings className="h-4 w-4" />,
  microsoft_365: <Settings className="h-4 w-4" />,
  custom: <Settings className="h-4 w-4" />
};

const categoryColors: Record<string, string> = {
  'Database': 'bg-blue-100 text-blue-800',
  'Communication': 'bg-green-100 text-green-800',
  'Project Management': 'bg-purple-100 text-purple-800',
  'E-commerce': 'bg-orange-100 text-orange-800',
  'CRM': 'bg-red-100 text-red-800',
  'Marketing': 'bg-pink-100 text-pink-800',
  'Analytics': 'bg-indigo-100 text-indigo-800',
  'Finance': 'bg-yellow-100 text-yellow-800',
  'HR': 'bg-gray-100 text-gray-800'
};

export function IntegrationMarketplace({ 
  onSelectTemplate, 
  onInstallIntegration 
}: IntegrationMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | 'all'>('all');
  const [selectedType, setSelectedType] = useState<IntegrationType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('featured');

  const { data: templatesData, isLoading: templatesLoading } = useIntegrationTemplates();
  const { data: searchData, isLoading: searchLoading } = useMarketplaceSearch(
    searchQuery, 
    { category: selectedCategory, provider: selectedProvider, type: selectedType },
    !!searchQuery
  );

  const templates = templatesData?.data || [];
  const searchResults = searchData?.data || [];

  // Filter templates based on selected filters
  const filteredTemplates = useMemo(() => {
    let filtered = searchQuery ? searchResults : templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedProvider !== 'all') {
      filtered = filtered.filter(template => template.provider === selectedProvider);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    return filtered;
  }, [templates, searchResults, searchQuery, selectedCategory, selectedProvider, selectedType]);

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, IntegrationTemplate[]> = {};
    filteredTemplates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    });
    return grouped;
  }, [filteredTemplates]);

  // Get unique categories, providers, and types for filters
  const categories = useMemo(() => {
    const unique = [...new Set(templates.map(t => t.category))];
    return ['all', ...unique];
  }, [templates]);

  const providers = useMemo(() => {
    const unique = [...new Set(templates.map(t => t.provider))];
    return ['all', ...unique] as const;
  }, [templates]);

  const types = useMemo(() => {
    const unique = [...new Set(templates.map(t => t.type))];
    return ['all', ...unique] as const;
  }, [templates]);

  const handleTemplateSelect = (template: IntegrationTemplate) => {
    onSelectTemplate?.(template);
  };

  const handleInstall = (template: IntegrationTemplate) => {
    onInstallIntegration?.(template);
  };

  const renderTemplateCard = (template: IntegrationTemplate) => (
    <Card key={template.id} className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: template.color }}
            >
              {providerIcons[template.provider]}
            </div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="text-sm">
                {template.provider.charAt(0).toUpperCase() + template.provider.slice(1)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{template.rating}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge 
            variant="secondary" 
            className={categoryColors[template.category] || 'bg-gray-100 text-gray-800'}
          >
            {template.category}
          </Badge>
          {template.isOfficial && (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              Official
            </Badge>
          )}
          {template.isBeta && (
            <Badge variant="outline" className="border-orange-200 text-orange-600">
              Beta
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Popularity</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{template.popularity}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Capabilities</span>
            <span>{template.capabilities.filter(c => c.supported).length}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => handleTemplateSelect(template)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => handleInstall(template)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (templatesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
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
          <h2 className="text-2xl font-bold">Integration Marketplace</h2>
          <p className="text-gray-600">Discover and install third-party integrations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Custom Integration
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider === 'all' ? 'All Providers' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .filter(t => t.isOfficial)
              .slice(0, 6)
              .map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, 9)
              .map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .filter(t => t.isBeta)
              .slice(0, 6)
              .map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTemplates.map(renderTemplateCard)}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* No results */}
      {filteredTemplates.length === 0 && !templatesLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all integrations
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedProvider('all');
            setSelectedType('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
} 