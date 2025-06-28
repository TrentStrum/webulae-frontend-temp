'use client';

import React, { useState, useMemo } from 'react';
import { useCompanyFAQs, CompanyFAQ, CreateFAQRequest, UpdateFAQRequest } from '@/app/hooks/useCompanyFAQs';
import { useOrganizationFAQs } from '@/app/hooks/useOrganizationFAQs';
import { useOrganizations } from '@/app/hooks/useOrganizations';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Search, Plus, Edit, Trash2, HelpCircle, Eye, EyeOff, Tag, Building2, Globe } from 'lucide-react';
import { FAQ_CATEGORIES } from '@/app/types/faq.types';
import { FAQ } from '@/app/types/faq.types';

export const GlobalAdminFAQsManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'company' | 'organization'>('company');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  // Organizations hook
  const { organizations, isLoading: isLoadingOrganizations } = useOrganizations();

  // Company FAQs hooks
  const {
    useGetFAQs: useGetCompanyFAQs,
    useCreateFAQ: useCreateCompanyFAQ,
    useUpdateFAQ: useUpdateCompanyFAQ,
    useDeleteFAQ: useDeleteCompanyFAQ,
    useToggleFAQ: useToggleCompanyFAQ,
  } = useCompanyFAQs();

  // Organization FAQs hooks
  const {
    filteredFaqs: organizationFaqs,
    isLoading: isLoadingOrgFAQs,
    createFAQ: createOrgFAQ,
    updateFAQ: updateOrgFAQ,
    deleteFAQ: deleteOrgFAQ,
    toggleFAQ: toggleOrgFAQ,
    searchTerm: orgSearchTerm,
    setSearchTerm: setOrgSearchTerm,
    categoryFilter: orgCategoryFilter,
    setCategoryFilter: setOrgCategoryFilter,
  } = useOrganizationFAQs(selectedOrganization);

  // Company FAQs data
  const { data: companyFaqsData, isLoading: isLoadingCompanyFAQs } = useGetCompanyFAQs();
  const createCompanyFAQ = useCreateCompanyFAQ();
  const updateCompanyFAQ = useUpdateCompanyFAQ();
  const deleteCompanyFAQ = useDeleteCompanyFAQ();
  const toggleCompanyFAQ = useToggleCompanyFAQ();

  const companyFaqs = companyFaqsData || [];

  // Common state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<CompanyFAQ | FAQ | null>(null);
  const [deletingFAQ, setDeletingFAQ] = useState<CompanyFAQ | FAQ | null>(null);

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

  // Filter company FAQs
  const filteredCompanyFAQs = useMemo(() => {
    return companyFaqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [companyFaqs, searchTerm, selectedCategory]);

  // Handle create form submission
  const handleCreate = () => {
    if (!createForm.question.trim() || !createForm.answer.trim()) {
      return;
    }

    if (selectedTab === 'company') {
      createCompanyFAQ.mutate(createForm, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }
      });
    } else if (selectedTab === 'organization' && selectedOrganization) {
      createOrgFAQ({
        ...createForm,
        organization_id: selectedOrganization
      });
      setIsCreateModalOpen(false);
      resetCreateForm();
    }
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

    if (selectedTab === 'company') {
      updateCompanyFAQ.mutate({ id: editingFAQ.id, data: updateData }, {
        onSuccess: () => {
          setEditingFAQ(null);
          resetEditForm();
        }
      });
    } else if (selectedTab === 'organization') {
      updateOrgFAQ({ id: editingFAQ.id, data: updateData });
      setEditingFAQ(null);
      resetEditForm();
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!deletingFAQ) return;

    if (selectedTab === 'company') {
      deleteCompanyFAQ.mutate(deletingFAQ.id, {
        onSuccess: () => {
          setDeletingFAQ(null);
        }
      });
    } else if (selectedTab === 'organization') {
      deleteOrgFAQ(deletingFAQ.id);
      setDeletingFAQ(null);
    }
  };

  // Open edit modal
  const openEditModal = (faq: CompanyFAQ | FAQ) => {
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

  const resetCreateForm = () => {
    setCreateForm({
      question: '',
      answer: '',
      category: 'General',
      tags: [],
      priority: 1,
      is_active: true
    });
  };

  const resetEditForm = () => {
    setEditForm({
      question: '',
      answer: '',
      category: 'General',
      tags: [],
      priority: 1,
      is_active: true
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

  const renderFAQsList = (faqs: (CompanyFAQ | FAQ)[], isLoading: boolean) => {
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

    if (!faqs || faqs.length === 0) {
      return (
        <div className="text-center py-8">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
          <p className="text-muted-foreground">Create your first FAQ to get started.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(faq.category)}
                    <Badge variant="secondary" className="text-xs">
                      {faq.category}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(faq.priority)}`}>
                      Priority {faq.priority}
                    </Badge>
                    <Badge variant={faq.is_active ? "default" : "secondary"} className="text-xs">
                      {faq.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(faq)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
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
                          Are you sure you want to delete this FAQ? This action cannot be undone.
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
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{faq.answer}</p>
              {faq.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {faq.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Global Admin FAQs Management</h2>
          <p className="text-muted-foreground">
            Manage FAQs for company-wide knowledge and individual organizations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'company' | 'organization')}>
        <TabsList className="grid w-full grid-cols-2 bg-cosmic-gradient text-white p-1 rounded-full shadow-space-sm">
          <TabsTrigger
            value="company"
            className="flex items-center gap-2 rounded-full transition-orbit data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <Globe className="h-4 w-4" />
            Company FAQs
          </TabsTrigger>
          <TabsTrigger
            value="organization"
            className="flex items-center gap-2 rounded-full transition-orbit data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <Building2 className="h-4 w-4" />
            Organization FAQs
          </TabsTrigger>
        </TabsList>

        {/* Company FAQs Tab */}
        <TabsContent value="company" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FAQ_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetCreateForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Company FAQ</DialogTitle>
                  <DialogDescription>
                    Create a new frequently asked question for all users.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FAQ_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={createForm.priority.toString()} onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                            <SelectItem key={priority} value={priority.toString()}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <Input
                      value={createForm.tags.join(', ')}
                      onChange={(e) => handleTagsInput(e.target.value, true)}
                      placeholder="Enter tags separated by commas..."
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
                  <Button onClick={handleCreate}>Create FAQ</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {renderFAQsList(filteredCompanyFAQs, isLoadingCompanyFAQs)}
        </TabsContent>

        {/* Organization FAQs Tab */}
        <TabsContent value="organization" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium">Select Organization</label>
                <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Choose an organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOrganizations ? (
                      <SelectItem value="loading" disabled>Loading organizations...</SelectItem>
                    ) : (
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedOrganization && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search FAQs..."
                      value={orgSearchTerm}
                      onChange={(e) => setOrgSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={orgCategoryFilter} onValueChange={setOrgCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {FAQ_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            {selectedOrganization && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetCreateForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Organization FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Organization FAQ</DialogTitle>
                    <DialogDescription>
                      Create a new frequently asked question for {organizations.find(org => org.id === selectedOrganization)?.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FAQ_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={createForm.priority.toString()} onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: parseInt(value) }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                              <SelectItem key={priority} value={priority.toString()}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tags (comma-separated)</label>
                      <Input
                        value={createForm.tags.join(', ')}
                        onChange={(e) => handleTagsInput(e.target.value, true)}
                        placeholder="Enter tags separated by commas..."
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
                    <Button onClick={handleCreate}>Create FAQ</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {selectedOrganization ? (
            renderFAQsList(organizationFaqs, isLoadingOrgFAQs)
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select an Organization</h3>
              <p className="text-muted-foreground">Choose an organization to manage their FAQs.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingFAQ} onOpenChange={() => setEditingFAQ(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update the FAQ details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={editForm.priority.toString()} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                      <SelectItem key={priority} value={priority.toString()}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={editForm.tags.join(', ')}
                onChange={(e) => handleTagsInput(e.target.value, false)}
                placeholder="Enter tags separated by commas..."
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
            <Button onClick={handleUpdate}>Update FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 