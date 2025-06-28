'use client';

import React, { useState } from 'react';
import { useCompanyKnowledge, CompanyKnowledge } from '@/app/hooks/useCompanyKnowledge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Edit, Trash2, Eye, Plus, Search, Filter } from 'lucide-react';

export function CompanyKnowledgeManager() {
  const { useGetCompanyKnowledge, useUpdateCompanyKnowledge, useDeleteCompanyKnowledge } = useCompanyKnowledge();
  const { data: knowledge, isLoading, error } = useGetCompanyKnowledge();
  const updateKnowledge = useUpdateCompanyKnowledge();
  const deleteKnowledge = useDeleteCompanyKnowledge();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingKnowledge, setEditingKnowledge] = useState<CompanyKnowledge | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter knowledge based on search and category
  const filteredKnowledge = knowledge?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.service_name && item.service_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(knowledge?.map(item => item.category) || []))];

  const handleEdit = (item: CompanyKnowledge) => {
    setEditingKnowledge(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedData: Partial<CompanyKnowledge>) => {
    if (!editingKnowledge) return;

    await updateKnowledge.mutateAsync({
      id: editingKnowledge.id,
      data: updatedData
    });

    setIsEditDialogOpen(false);
    setEditingKnowledge(null);
  };

  const handleDelete = async (id: string) => {
    await deleteKnowledge.mutateAsync(id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading company knowledge: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Company Knowledge Manager
          </CardTitle>
          <CardDescription>
            View, edit, and delete company knowledge entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search knowledge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Knowledge List */}
          <div className="space-y-4">
            {filteredKnowledge.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No knowledge entries match your search criteria'
                  : 'No company knowledge entries found'
                }
              </div>
            ) : (
              filteredKnowledge.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Badge variant="secondary">{item.category}</Badge>
                          {item.service_name && (
                            <Badge variant="outline">Service</Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {item.content}
                        </p>
                        
                        {item.service_name && (
                          <div className="text-sm text-gray-500 mb-2">
                            <strong>Service:</strong> {item.service_name}
                          </div>
                        )}
                        
                        {item.pricing_info && (
                          <div className="text-sm text-gray-500 mb-2">
                            <strong>Pricing:</strong> {item.pricing_info}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Created: {formatDate(item.created_at)}</span>
                          {item.updated_at && item.updated_at !== item.created_at && (
                            <span>Updated: {formatDate(item.updated_at)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Dialog open={isEditDialogOpen && editingKnowledge?.id === item.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Knowledge Entry</DialogTitle>
                              <DialogDescription>
                                Update the knowledge entry details
                              </DialogDescription>
                            </DialogHeader>
                            <EditKnowledgeForm
                              knowledge={editingKnowledge}
                              onSave={handleSaveEdit}
                              onCancel={() => {
                                setIsEditDialogOpen(false);
                                setEditingKnowledge(null);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Knowledge Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface EditKnowledgeFormProps {
  knowledge: CompanyKnowledge | null;
  onSave: (data: Partial<CompanyKnowledge>) => Promise<void>;
  onCancel: () => void;
}

function EditKnowledgeForm({ knowledge, onSave, onCancel }: EditKnowledgeFormProps) {
  const [formData, setFormData] = useState({
    category: knowledge?.category || '',
    title: knowledge?.title || '',
    content: knowledge?.content || '',
    service_name: knowledge?.service_name || '',
    service_description: knowledge?.service_description || '',
    pricing_info: knowledge?.pricing_info || '',
    use_cases: knowledge?.use_cases || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include fields that have values
    const updateData: Partial<CompanyKnowledge> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim()) {
        updateData[key as keyof CompanyKnowledge] = value.trim();
      }
    });

    await onSave(updateData);
  };

  if (!knowledge) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-category">Category</Label>
          <Input
            id="edit-category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., FAQ, Services, Best Practices"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Knowledge title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-content">Content</Label>
        <Textarea
          id="edit-content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Knowledge content"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-service-name">Service Name (Optional)</Label>
          <Input
            id="edit-service-name"
            value={formData.service_name}
            onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
            placeholder="Service name if applicable"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-pricing">Pricing Info (Optional)</Label>
          <Input
            id="edit-pricing"
            value={formData.pricing_info}
            onChange={(e) => setFormData(prev => ({ ...prev, pricing_info: e.target.value }))}
            placeholder="e.g., Starting at $2,500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-service-description">Service Description (Optional)</Label>
        <Textarea
          id="edit-service-description"
          value={formData.service_description}
          onChange={(e) => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
          placeholder="Service description"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-use-cases">Use Cases (Optional)</Label>
        <Textarea
          id="edit-use-cases"
          value={formData.use_cases}
          onChange={(e) => setFormData(prev => ({ ...prev, use_cases: e.target.value }))}
          placeholder="e.g., Invoice processing, contract analysis..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.title.trim() || !formData.content.trim()}>
          Save Changes
        </Button>
      </div>
    </form>
  );
} 