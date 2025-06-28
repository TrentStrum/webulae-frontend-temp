'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SystemPrompt, CreateSystemPromptRequest, UpdateSystemPromptRequest } from '@/app/types/systemPrompt.types';
import { useOrganizationSystemPrompts } from '@/app/hooks/useOrganizationSystemPrompts';
import { useOrganizations } from '@/app/hooks/useOrganizations';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Plus, Building2 } from 'lucide-react';
import { SystemPromptFilters } from './SystemPromptFilters';
import { SystemPromptList } from './SystemPromptList';
import { SystemPromptForm } from './SystemPromptForm';

export const OrganizationSystemPromptsTab: React.FC = () => {
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<SystemPrompt | null>(null);

  // Organizations hook
  const { organizations, isLoading: isLoadingOrganizations } = useOrganizations();

  // Log the selected organization
  console.log('selectedOrganization', selectedOrganization);
  const {
    systemPrompts: organizationSystemPrompts,
    isLoading: isLoadingOrgPrompts,
    createSystemPrompt,
    updateSystemPrompt,
    deleteSystemPrompt,
    searchTerm: orgSearchTerm,
    setSearchTerm: setOrgSearchTerm,
    categoryFilter: orgCategoryFilter,
    setCategoryFilter: setOrgCategoryFilter,
    refetch: refetchOrgPrompts,
  } = useOrganizationSystemPrompts(selectedOrganization);

  // Add logging to debug prompt data
  console.log('organizationSystemPrompts', organizationSystemPrompts);

  // Refetch prompts when organization changes
  useEffect(() => {
    if (selectedOrganization) {
      refetchOrgPrompts();
    }
  }, [selectedOrganization, refetchOrgPrompts]);

  // Check if there's an active prompt for the selected organization
  const hasActivePrompt = useMemo(() => {
    return organizationSystemPrompts.some(prompt => prompt.is_active);
  }, [organizationSystemPrompts]);

  const handleCreate = (data: CreateSystemPromptRequest) => {
    if (!selectedOrganization) return;
    
    createSystemPrompt({
      ...data,
      organization_id: selectedOrganization,
    });
    setIsCreateModalOpen(false);
  };

  const handleUpdate = (data: UpdateSystemPromptRequest) => {
    if (!editingPrompt) return;
    
    updateSystemPrompt(editingPrompt.id, data);
    setEditingPrompt(null);
  };

  const handleDelete = () => {
    if (!deletingPrompt) return;
    
    deleteSystemPrompt(deletingPrompt.id);
    setDeletingPrompt(null);
  };

  const openEditModal = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
  };

  const selectedOrgName = organizations.find(org => org.id === selectedOrganization)?.name;

  return (
    <div className="space-y-4">
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
            <SystemPromptFilters
              searchTerm={orgSearchTerm}
              onSearchChange={setOrgSearchTerm}
              categoryFilter={orgCategoryFilter}
              onCategoryChange={setOrgCategoryFilter}
            />
          )}
        </div>
        {selectedOrganization && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization Prompt
          </Button>
        )}
      </div>

      {selectedOrganization ? (
        <SystemPromptList
          prompts={organizationSystemPrompts}
          isLoading={isLoadingOrgPrompts}
          onEdit={openEditModal}
          onDelete={setDeletingPrompt}
        />
      ) : (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select an Organization</h3>
          <p className="text-muted-foreground">Choose an organization to manage their system prompts.</p>
        </div>
      )}

      {/* Create Modal */}
      <SystemPromptForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Add Organization System Prompt"
        description={`Create a new system prompt for ${selectedOrgName}.`}
        submitLabel="Create Prompt"
        isLoading={false}
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
        isLoading={false}
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