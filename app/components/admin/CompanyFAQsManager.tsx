'use client';

import React, { useState, useMemo } from 'react';
import { useCompanyFAQs, CompanyFAQ, CreateFAQRequest, UpdateFAQRequest } from '@/app/hooks/useCompanyFAQs';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Switch } from '@/app/components/ui/switch';
import { Search, Plus, Edit, Trash2, HelpCircle, Eye, EyeOff, Tag } from 'lucide-react';
import { FAQ_CATEGORIES } from '@/app/types/faq.types';

export const CompanyFAQsManager: React.FC = () => {
  const {
    useGetFAQs,
    useCreateFAQ,
    useUpdateFAQ,
    useDeleteFAQ,
    useToggleFAQ,
  } = useCompanyFAQs();

  const { data: faqsData, isLoading, refetch } = useGetFAQs();
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();
  const deleteFAQ = useDeleteFAQ();
  const toggleFAQ = useToggleFAQ();

  const faqs = faqsData?.faqs || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<CompanyFAQ | null>(null);
  const [deletingFAQ, setDeletingFAQ] = useState<CompanyFAQ | null>(null);

  // Form state for creating new FAQ
  const [createForm, setCreateForm] = useState<CreateFAQRequest>({
    question: '',
    answer: '',
    category: 'General',
    tags: [],
    priority: 1,
    is_active: true
  });

  // Form state for editing FAQ
  const [editForm, setEditForm] = useState<UpdateFAQRequest>({
    question: '',
    answer: '',
    category: 'General',
    tags: [],
    priority: 1,
    is_active: true
  });

  // Filter and search FAQs
  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, selectedCategory]);

  // Handle create form submission
  const handleCreate = () => {
    if (!createForm.question.trim() || !createForm.answer.trim()) {
      return;
    }

    createFAQ.mutate(createForm, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setCreateForm({
          question: '',
          answer: '',
          category: 'General',
          tags: [],
          priority: 1,
          is_active: true
        });
      }
    });
  };

  // Handle edit form submission
  const handleUpdate = () => {
    if (!editingFAQ) return;

    const updateData: UpdateFAQRequest = {};
    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        updateData[key as keyof UpdateFAQRequest] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return;
    }

    updateFAQ.mutate({ id: editingFAQ.id, data: updateData }, {
      onSuccess: () => {
        setEditingFAQ(null);
        setEditForm({
          question: '',
          answer: '',
          category: 'General',
          tags: [],
          priority: 1,
          is_active: true
        });
      }
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (!deletingFAQ) return;

    deleteFAQ.mutate(deletingFAQ.id, {
      onSuccess: () => {
        setDeletingFAQ(null);
      }
    });
  };

  // Open edit modal
  const openEditModal = (faq: CompanyFAQ) => {
    setEditingFAQ(faq);
    setEditForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags,
      priority: faq.priority,
      is_active: faq.is_active
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical': return <HelpCircle className="h-4 w-4" />;
      case 'Support': return <HelpCircle className="h-4 w-4" />;
      case 'Training': return <HelpCircle className="h-4 w-4" />;
      case 'Product': return <HelpCircle className="h-4 w-4" />;
      case 'Billing': return <HelpCircle className="h-4 w-4" />;
      case 'Security': return <HelpCircle className="h-4 w-4" />;
      case 'Integration': return <HelpCircle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'bg-red-100 text-red-800';
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Handle tags input
  const handleTagsInput = (tagsString: string, isCreate: boolean = true) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (isCreate) {
      setCreateForm(prev => ({ ...prev, tags }));
    } else {
      setEditForm(prev => ({ ...prev, tags }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company FAQs</h2>
          <p className="text-muted-foreground">
            Manage frequently asked questions that help users understand your services
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add FAQ</DialogTitle>
              <DialogDescription>
                Create a new frequently asked question to help users.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FAQ_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Question</label>
                <Input
                  value={createForm.question}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Answer</label>
                <Textarea
                  value={createForm.answer}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Enter the answer..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={createForm.tags.join(', ')}
                  onChange={(e) => handleTagsInput(e.target.value, true)}
                  placeholder="e.g., setup, troubleshooting, billing"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={createForm.is_active}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, is_active: checked }))}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createFAQ.isPending || !createForm.question.trim() || !createForm.answer.trim()}
              >
                {createFAQ.isPending ? 'Creating...' : 'Create FAQ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {FAQ_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No FAQs found</p>
                <p className="text-sm text-muted-foreground">Create your first FAQ to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(faq.category)}
                      <h3 className="text-lg font-semibold">{faq.question}</h3>
                      <Badge variant="outline">{faq.category}</Badge>
                      <Badge className={getPriorityColor(faq.priority)}>
                        Priority {faq.priority}
                      </Badge>
                      <Badge variant={faq.is_active ? "default" : "secondary"}>
                        {faq.is_active ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-3">{faq.answer}</p>
                    {faq.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div className="flex gap-1 flex-wrap">
                          {faq.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(faq.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(faq.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(faq)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingFAQ(faq)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{faq.question}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
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

      {/* Edit Modal */}
      <Dialog open={!!editingFAQ} onOpenChange={() => setEditingFAQ(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update the FAQ question, answer, and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editForm.priority}
                  onChange={(e) => setEditForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Question</label>
              <Input
                value={editForm.question}
                onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter the question..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={editForm.answer}
                onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Enter the answer..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={editForm.tags?.join(', ') || ''}
                onChange={(e) => handleTagsInput(e.target.value, false)}
                placeholder="e.g., setup, troubleshooting, billing"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editForm.is_active}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFAQ(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updateFAQ.isPending || !editForm.question?.trim() || !editForm.answer?.trim()}
            >
              {updateFAQ.isPending ? 'Updating...' : 'Update FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 