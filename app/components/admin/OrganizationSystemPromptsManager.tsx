'use client';

import React, { useState } from 'react';
import { useOrganizationSystemPrompts } from '@/app/hooks/useOrganizationSystemPrompts';
import { SystemPrompt, CreateSystemPromptRequest, UpdateSystemPromptRequest } from '@/app/types/systemPrompt.types';
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
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Tag, Calendar, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const OrganizationSystemPromptsManager: React.FC = () => {
  const {
    systemPrompts,
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
    createSystemPrompt,
    updateSystemPrompt,
    deleteSystemPrompt,
    toggleSystemPromptStatus,
  } = useOrganizationSystemPrompts();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);

  // Form state for creating new system prompt
  const [createForm, setCreateForm] = useState<CreateSystemPromptRequest>({
    name: '',
    content: '',
    category: '',
    priority: 1,
    is_active: true,
  });

  // Form state for editing system prompt
  const [editForm, setEditForm] = useState<UpdateSystemPromptRequest>({
    name: '',
    content: '',
    category: '',
    priority: 1,
    is_active: true,
  });

  const handleCreateSystemPrompt = async () => {
    if (!createForm.name || !createForm.content || !createForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createSystemPrompt(createForm);
    if (result.success) {
      toast.success('System prompt created successfully');
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: '',
        content: '',
        category: '',
        priority: 1,
        is_active: true,
      });
    } else {
      toast.error('Failed to create system prompt');
    }
  };

  const handleEditSystemPrompt = async () => {
    if (!editingPrompt || !editForm.name || !editForm.content || !editForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await updateSystemPrompt(editingPrompt.id, editForm);
    if (result.success) {
      toast.success('System prompt updated successfully');
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      setEditForm({
        name: '',
        content: '',
        category: '',
        priority: 1,
        is_active: true,
      });
    } else {
      toast.error('Failed to update system prompt');
    }
  };

  const handleDeleteSystemPrompt = async (prompt: SystemPrompt) => {
    const result = await deleteSystemPrompt(prompt.id);
    if (result.success) {
      toast.success('System prompt deleted successfully');
    } else {
      toast.error('Failed to delete system prompt');
    }
  };

  const handleToggleStatus = async (prompt: SystemPrompt) => {
    const result = await toggleSystemPromptStatus(prompt.id, !prompt.is_active);
    if (result.success) {
      toast.success(`System prompt ${prompt.is_active ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Failed to update system prompt status');
    }
  };

  const openEditDialog = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
    setEditForm({
      name: prompt.name,
      content: prompt.content,
      category: prompt.category,
      priority: prompt.priority,
      is_active: prompt.is_active,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading system prompts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organization System Prompts</h1>
          <p className="text-muted-foreground">Manage your organization's AI system prompts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add System Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New System Prompt</DialogTitle>
              <DialogDescription>Add a new system prompt for your organization's AI.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter prompt name"
                />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={createForm.content}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter prompt content"
                  rows={6}
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
              <Button onClick={handleCreateSystemPrompt} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create System Prompt'}
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
                  placeholder="Search names, content, categories..."
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

      {/* System Prompts List */}
      <div className="space-y-4">
        {systemPrompts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-muted-foreground">No system prompts found</p>
                {searchTerm || categoryFilter || statusFilter !== 'all' ? (
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Create your first system prompt to get started</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          systemPrompts.map(prompt => (
            <Card key={prompt.id} className={!prompt.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{prompt.name}</CardTitle>
                      <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                        {prompt.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Priority {prompt.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {prompt.category}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(prompt)}
                      disabled={isTogglingStatus}
                    >
                      {prompt.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(prompt)}
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
                          <AlertDialogTitle>Delete System Prompt</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this system prompt? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSystemPrompt(prompt)}
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
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Content:</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{prompt.content}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit System Prompt</DialogTitle>
            <DialogDescription>Update the system prompt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter prompt name"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter prompt content"
                rows={6}
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
            <Button onClick={handleEditSystemPrompt} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update System Prompt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 