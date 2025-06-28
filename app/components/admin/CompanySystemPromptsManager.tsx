'use client';

import React, { useState, useMemo } from 'react';
import { useCompanySystemPrompts, CompanySystemPrompt, CreateSystemPromptRequest, UpdateSystemPromptRequest } from '@/app/hooks/useCompanySystemPrompts';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Switch } from '@/app/components/ui/switch';
import { Search, Plus, Edit, Trash2, MessageSquare, Settings, Eye, EyeOff } from 'lucide-react';
import { SYSTEM_PROMPT_CATEGORIES } from '@/app/types/systemPrompt.types';

export const CompanySystemPromptsManager: React.FC = () => {
  const {
    useGetSystemPrompts,
    useCreateSystemPrompt,
    useUpdateSystemPrompt,
    useDeleteSystemPrompt,
    useToggleSystemPrompt,
  } = useCompanySystemPrompts();

  const { data: systemPromptsData, isLoading, refetch } = useGetSystemPrompts();
  const createPrompt = useCreateSystemPrompt();
  const updatePrompt = useUpdateSystemPrompt();
  const deletePrompt = useDeleteSystemPrompt();
  const togglePrompt = useToggleSystemPrompt();

  const systemPrompts = systemPromptsData?.prompts || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<CompanySystemPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<CompanySystemPrompt | null>(null);

  // Form state for creating new prompt
  const [createForm, setCreateForm] = useState<CreateSystemPromptRequest>({
    prompt_name: '',
    content: '',
    category: 'General',
    priority: 1,
    is_active: true
  });

  // Form state for editing prompt
  const [editForm, setEditForm] = useState<UpdateSystemPromptRequest>({
    prompt_name: '',
    content: '',
    category: 'General',
    priority: 1,
    is_active: true
  });

  // Filter and search prompts
  const filteredPrompts = useMemo(() => {
    return systemPrompts.filter(prompt => {
      const matchesSearch = prompt.prompt_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [systemPrompts, searchTerm, selectedCategory]);

  // Handle create form submission
  const handleCreate = () => {
    if (!createForm.prompt_name.trim() || !createForm.content.trim()) {
      return;
    }

    createPrompt.mutate(createForm, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setCreateForm({
          prompt_name: '',
          content: '',
          category: 'General',
          priority: 1,
          is_active: true
        });
      }
    });
  };

  // Handle edit form submission
  const handleUpdate = () => {
    if (!editingPrompt) return;

    const updateData: UpdateSystemPromptRequest = {};
    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        updateData[key as keyof UpdateSystemPromptRequest] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return;
    }

    updatePrompt.mutate({ id: editingPrompt.id, data: updateData }, {
      onSuccess: () => {
        setEditingPrompt(null);
        setEditForm({
          prompt_name: '',
          content: '',
          category: 'General',
          priority: 1,
          is_active: true
        });
      }
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (!deletingPrompt) return;

    deletePrompt.mutate(deletingPrompt.id, {
      onSuccess: () => {
        setDeletingPrompt(null);
      }
    });
  };

  // Open edit modal
  const openEditModal = (prompt: CompanySystemPrompt) => {
    setEditingPrompt(prompt);
    setEditForm({
      prompt_name: prompt.prompt_name,
      content: prompt.content,
      category: prompt.category,
      priority: prompt.priority,
      is_active: prompt.is_active
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tone': return <MessageSquare className="h-4 w-4" />;
      case 'Style': return <Settings className="h-4 w-4" />;
      case 'Brand Voice': return <MessageSquare className="h-4 w-4" />;
      case 'Response Preferences': return <Settings className="h-4 w-4" />;
      case 'Behavior': return <Settings className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'bg-red-100 text-red-800';
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading system prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company System Prompts</h2>
          <p className="text-muted-foreground">
            Manage system prompts that define the AI assistant's tone, style, and behavior for all organizations
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add System Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add System Prompt</DialogTitle>
              <DialogDescription>
                Create a new system prompt that will influence how the AI assistant responds to users.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prompt Name</label>
                  <Input
                    value={createForm.prompt_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, prompt_name: e.target.value }))}
                    placeholder="e.g., Professional Tone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEM_PROMPT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the system prompt content..."
                  rows={6}
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
                disabled={createPrompt.isPending || !createForm.prompt_name.trim() || !createForm.content.trim()}
              >
                {createPrompt.isPending ? 'Creating...' : 'Create Prompt'}
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
              placeholder="Search prompts..."
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
            {SYSTEM_PROMPT_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No system prompts found</p>
                <p className="text-sm text-muted-foreground">Create your first system prompt to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(prompt.category)}
                      <h3 className="text-lg font-semibold">{prompt.prompt_name}</h3>
                      <Badge variant="outline">{prompt.category}</Badge>
                      <Badge className={getPriorityColor(prompt.priority)}>
                        Priority {prompt.priority}
                      </Badge>
                      <Badge variant={prompt.is_active ? "default" : "secondary"}>
                        {prompt.is_active ? (
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
                    <p className="text-muted-foreground line-clamp-3">{prompt.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(prompt.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingPrompt(prompt)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete System Prompt</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{prompt.prompt_name}"? This action cannot be undone.
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
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit System Prompt</DialogTitle>
            <DialogDescription>
              Update the system prompt settings and content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prompt Name</label>
                <Input
                  value={editForm.prompt_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, prompt_name: e.target.value }))}
                  placeholder="e.g., Professional Tone"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_PROMPT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter the system prompt content..."
                rows={6}
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
            <Button variant="outline" onClick={() => setEditingPrompt(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updatePrompt.isPending || !editForm.prompt_name?.trim() || !editForm.content?.trim()}
            >
              {updatePrompt.isPending ? 'Updating...' : 'Update Prompt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 