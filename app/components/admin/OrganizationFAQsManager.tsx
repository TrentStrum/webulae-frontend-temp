'use client';

import React, { useState } from 'react';
import { useOrganizationFAQs } from '@/app/hooks/useOrganizationFAQs';
import { FAQ, CreateFAQRequest, UpdateFAQRequest } from '@/app/types/faq.types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Switch } from '@/app/components/ui/switch';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Tag, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';

export const OrganizationFAQsManager: React.FC = () => {
  const {
    faqs,
    categories,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingStatus,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    toggleFAQStatus,
  } = useOrganizationFAQs();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [newTags, setNewTags] = useState<string>('');

  // Form state for creating new FAQ
  const [createForm, setCreateForm] = useState<CreateFAQRequest>({
    question: '',
    answer: '',
    category: '',
    tags: [],
    priority: 1,
    is_active: true,
  });

  // Form state for editing FAQ
  const [editForm, setEditForm] = useState<UpdateFAQRequest>({
    question: '',
    answer: '',
    category: '',
    tags: [],
    priority: 1,
    is_active: true,
  });

  const handleCreateFAQ = async () => {
    if (!createForm.question || !createForm.answer || !createForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createFAQ(createForm);
    if (result.success) {
      toast.success('FAQ created successfully');
      setIsCreateDialogOpen(false);
      setCreateForm({
        question: '',
        answer: '',
        category: '',
        tags: [],
        priority: 1,
        is_active: true,
      });
    } else {
      toast.error('Failed to create FAQ');
    }
  };

  const handleEditFAQ = async () => {
    if (!editingFAQ || !editForm.question || !editForm.answer || !editForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await updateFAQ(editingFAQ.id, editForm);
    if (result.success) {
      toast.success('FAQ updated successfully');
      setIsEditDialogOpen(false);
      setEditingFAQ(null);
      setEditForm({
        question: '',
        answer: '',
        category: '',
        tags: [],
        priority: 1,
        is_active: true,
      });
    } else {
      toast.error('Failed to update FAQ');
    }
  };

  const handleDeleteFAQ = async (faq: FAQ) => {
    const result = await deleteFAQ(faq.id);
    if (result.success) {
      toast.success('FAQ deleted successfully');
    } else {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleToggleStatus = async (faq: FAQ) => {
    const result = await toggleFAQStatus(faq.id, !faq.is_active);
    if (result.success) {
      toast.success(`FAQ ${faq.is_active ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Failed to update FAQ status');
    }
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFAQ(faq);
    setEditForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags,
      priority: faq.priority,
      is_active: faq.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const addTagToCreate = () => {
    if (newTags.trim() && !createForm.tags.includes(newTags.trim())) {
      setCreateForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTags.trim()]
      }));
      setNewTags('');
    }
  };

  const removeTagFromCreate = (tagToRemove: string) => {
    setCreateForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTagToEdit = () => {
    if (newTags.trim() && !editForm.tags.includes(newTags.trim())) {
      setEditForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTags.trim()]
      }));
      setNewTags('');
    }
  };

  const removeTagFromEdit = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organization FAQs</h1>
          <p className="text-muted-foreground">Manage your organization's frequently asked questions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New FAQ</DialogTitle>
              <DialogDescription>Add a new frequently asked question for your organization.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={createForm.question}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={createForm.answer}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Enter the answer"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={createForm.category}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={createForm.priority.toString()} onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTagToCreate()}
                  />
                  <Button type="button" variant="outline" onClick={addTagToCreate}>Add</Button>
                </div>
                {createForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {createForm.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTagFromCreate(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={createForm.is_active}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateFAQ} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create FAQ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search questions, answers, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-muted-foreground">No FAQs found</p>
                {searchTerm || categoryFilter || statusFilter !== 'all' ? (
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Create your first FAQ to get started</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          faqs.map(faq => (
            <Card key={faq.id} className={!faq.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                        {faq.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Priority {faq.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {faq.category}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(faq.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(faq)}
                      disabled={isTogglingStatus}
                    >
                      {faq.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(faq)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this FAQ? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFAQ(faq)}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{faq.answer}</p>
                {faq.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {faq.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the frequently asked question.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Question *</Label>
              <Input
                id="edit-question"
                value={editForm.question}
                onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter the question"
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Answer *</Label>
              <Textarea
                id="edit-answer"
                value={editForm.answer}
                onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Enter the answer"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Input
                id="edit-category"
                value={editForm.category}
                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category"
              />
            </div>
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={editForm.priority?.toString() || '1'} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTagToEdit()}
                />
                <Button type="button" variant="outline" onClick={addTagToEdit}>Add</Button>
              </div>
              {editForm.tags && editForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editForm.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTagFromEdit(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-active"
                checked={editForm.is_active}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-is-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditFAQ} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 