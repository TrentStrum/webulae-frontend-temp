'use client';

import React, { useState, useMemo } from 'react';
import { useOrganizationKnowledge, OrganizationKnowledge, CreateOrganizationKnowledgeRequest, UpdateOrganizationKnowledgeRequest } from '@/app/hooks/useOrganizationKnowledge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, FileText, Settings, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationKnowledgeManagerProps {
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

export const OrganizationKnowledgeManager: React.FC<OrganizationKnowledgeManagerProps> = ({
  organizationId,
  organizationName = 'Organization'
}) => {
  const {
    knowledge,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    create,
    update,
    delete: deleteKnowledge,
    refetch
  } = useOrganizationKnowledge(organizationId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<OrganizationKnowledge | null>(null);
  const [deletingKnowledge, setDeletingKnowledge] = useState<OrganizationKnowledge | null>(null);

  // Form state for creating new knowledge
  const [createForm, setCreateForm] = useState<CreateOrganizationKnowledgeRequest>({
    category: 'FAQ',
    title: '',
    content: '',
    service_name: '',
    service_description: '',
    pricing_info: '',
    use_cases: ''
  });

  // Form state for editing knowledge
  const [editForm, setEditForm] = useState<UpdateOrganizationKnowledgeRequest>({
    category: '',
    title: '',
    content: '',
    service_name: '',
    service_description: '',
    pricing_info: '',
    use_cases: ''
  });

  // Filter and search knowledge
  const filteredKnowledge = useMemo(() => {
    return knowledge.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.service_name && item.service_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [knowledge, searchTerm, selectedCategory]);

  // Handle create form submission
  const handleCreate = () => {
    if (!createForm.title.trim() || !createForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    create(createForm, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setCreateForm({
          category: 'FAQ',
          title: '',
          content: '',
          service_name: '',
          service_description: '',
          pricing_info: '',
          use_cases: ''
        });
      }
    });
  };

  // Handle edit form submission
  const handleUpdate = () => {
    if (!editingKnowledge) return;

    const updateData: UpdateOrganizationKnowledgeRequest = {};
    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        updateData[key as keyof UpdateOrganizationKnowledgeRequest] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      toast.error('No changes to update');
      return;
    }

    update({ id: editingKnowledge.id, data: updateData }, {
      onSuccess: () => {
        setEditingKnowledge(null);
        setEditForm({
          category: '',
          title: '',
          content: '',
          service_name: '',
          service_description: '',
          pricing_info: '',
          use_cases: ''
        });
      }
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (!deletingKnowledge) return;

    deleteKnowledge(deletingKnowledge.id, {
      onSuccess: () => {
        setDeletingKnowledge(null);
      }
    });
  };

  // Open edit modal
  const openEditModal = (knowledge: OrganizationKnowledge) => {
    setEditingKnowledge(knowledge);
    setEditForm({
      category: knowledge.category,
      title: knowledge.title,
      content: knowledge.content,
      service_name: knowledge.service_name || '',
      service_description: knowledge.service_description || '',
      pricing_info: knowledge.pricing_info || '',
      use_cases: knowledge.use_cases || ''
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FAQ': return <FileText className="h-4 w-4" />;
      case 'Service': return <Settings className="h-4 w-4" />;
      case 'Product': return <DollarSign className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading organization knowledge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Knowledge</h2>
          <p className="text-muted-foreground">
            Manage knowledge specific to {organizationName}
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Organization Knowledge</DialogTitle>
              <DialogDescription>
                Add new knowledge that will be available to your organization's chatbot.
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
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter content"
                  rows={4}
                />
              </div>
              {createForm.category === 'Service' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Service Name</label>
                    <Input
                      value={createForm.service_name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, service_name: e.target.value }))}
                      placeholder="Enter service name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Service Description</label>
                    <Textarea
                      value={createForm.service_description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, service_description: e.target.value }))}
                      placeholder="Enter service description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pricing Information</label>
                    <Textarea
                      value={createForm.pricing_info}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, pricing_info: e.target.value }))}
                      placeholder="Enter pricing information"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Use Cases</label>
                    <Textarea
                      value={createForm.use_cases}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, use_cases: e.target.value }))}
                      placeholder="Enter use cases"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add Knowledge'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search knowledge..."
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
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Knowledge List */}
      <div className="grid gap-4">
        {filteredKnowledge.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No knowledge found</p>
                {searchTerm || selectedCategory !== 'all' ? (
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Add your first piece of knowledge to get started</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredKnowledge.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        {item.service_name && (
                          <Badge variant="outline">{item.service_name}</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingKnowledge(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Knowledge</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{item.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingKnowledge(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  {item.service_description && (
                    <div>
                      <p className="text-sm font-medium">Service Description:</p>
                      <p className="text-sm text-muted-foreground">{item.service_description}</p>
                    </div>
                  )}
                  {item.pricing_info && (
                    <div>
                      <p className="text-sm font-medium">Pricing:</p>
                      <p className="text-sm text-muted-foreground">{item.pricing_info}</p>
                    </div>
                  )}
                  {item.use_cases && (
                    <div>
                      <p className="text-sm font-medium">Use Cases:</p>
                      <p className="text-sm text-muted-foreground">{item.use_cases}</p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(item.created_at || '').toLocaleDateString()}
                    {item.updated_at && item.updated_at !== item.created_at && (
                      <span> • Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingKnowledge} onOpenChange={(open) => !open && setEditingKnowledge(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Organization Knowledge</DialogTitle>
            <DialogDescription>
              Update the knowledge entry for your organization.
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
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter content"
                rows={4}
              />
            </div>
            {editForm.category === 'Service' && (
              <>
                <div>
                  <label className="text-sm font-medium">Service Name</label>
                  <Input
                    value={editForm.service_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="Enter service name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Service Description</label>
                  <Textarea
                    value={editForm.service_description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, service_description: e.target.value }))}
                    placeholder="Enter service description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pricing Information</label>
                  <Textarea
                    value={editForm.pricing_info}
                    onChange={(e) => setEditForm(prev => ({ ...prev, pricing_info: e.target.value }))}
                    placeholder="Enter pricing information"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Use Cases</label>
                  <Textarea
                    value={editForm.use_cases}
                    onChange={(e) => setEditForm(prev => ({ ...prev, use_cases: e.target.value }))}
                    placeholder="Enter use cases"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKnowledge(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Knowledge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 