'use client';

import React, { useState, useMemo } from 'react';
import { SystemPrompt, CreateSystemPromptRequest, UpdateSystemPromptRequest } from '@/app/types/systemPrompt.types';
import { useCompanySystemPrompts } from '@/app/hooks/useCompanySystemPrompts';
import { Button } from '@/app/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { SystemPromptFilters } from './SystemPromptFilters';
import { SystemPromptList } from './SystemPromptList';
import { SystemPromptForm } from './SystemPromptForm';

export const CompanySystemPromptsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<SystemPrompt | null>(null);

  // React Query hooks
  const {
    useGetSystemPrompts,
    useCreateSystemPrompt,
    useUpdateSystemPrompt,
    useDeleteSystemPrompt,
  } = useCompanySystemPrompts();

  const { data: promptsData, isLoading } = useGetSystemPrompts();
  const createMutation = useCreateSystemPrompt();
  const updateMutation = useUpdateSystemPrompt();
  const deleteMutation = useDeleteSystemPrompt();

  const prompts = promptsData?.prompts || [];

  // Check if there's an active prompt
  const hasActivePrompt = useMemo(() => {
    return prompts.some(prompt => prompt.is_active);
  }, [prompts]);

  // Filter prompts based on search and category
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = !searchTerm || 
        prompt.prompt_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchTerm, categoryFilter]);

  const handleCreate = (data: CreateSystemPromptRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  const handleUpdate = (data: UpdateSystemPromptRequest) => {
    if (!editingPrompt) return;
    
    updateMutation.mutate({ id: editingPrompt.id, data }, {
      onSuccess: () => {
        setEditingPrompt(null);
      },
    });
  };

  const handleDelete = () => {
    if (!deletingPrompt) return;
    
    deleteMutation.mutate(deletingPrompt.id, {
      onSuccess: () => {
        setDeletingPrompt(null);
      },
    });
  };

  const openEditModal = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SystemPromptFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company Prompt
        </Button>
      </div>

      <SystemPromptList
        prompts={filteredPrompts}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={setDeletingPrompt}
      />

      {/* Create Modal */}
      <SystemPromptForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Add Company System Prompt"
        description="Create a new system prompt that will be applied to all AI interactions."
        submitLabel="Create Prompt"
        isLoading={createMutation.isPending}
        hasActivePrompt={hasActivePrompt}
      />

      {/* Edit Modal */}
      <SystemPromptForm
        isOpen={!!editingPrompt}
        onClose={() => setEditingPrompt(null)}
        onSubmit={handleUpdate}
        initialData={editingPrompt || undefined}
        title="Edit System Prompt"
        description="Update the system prompt details."
        submitLabel="Update Prompt"
        isLoading={updateMutation.isPending}
        hasActivePrompt={hasActivePrompt}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPrompt} onOpenChange={() => setDeletingPrompt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete System Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this system prompt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 