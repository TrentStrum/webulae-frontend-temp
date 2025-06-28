'use client';

import React from 'react';
import { SystemPrompt } from '@/app/types/systemPrompt.types';
import { SystemPromptCard } from './SystemPromptCard';
import { MessageSquare } from 'lucide-react';

interface SystemPromptListProps {
  prompts: SystemPrompt[];
  isLoading: boolean;
  onEdit: (prompt: SystemPrompt) => void;
  onDelete: (prompt: SystemPrompt) => void;
}

export const SystemPromptList: React.FC<SystemPromptListProps> = ({
  prompts,
  isLoading,
  onEdit,
  onDelete,
}) => {
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

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No system prompts found</h3>
        <p className="text-muted-foreground">Create your first system prompt to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {prompts.map((prompt) => (
        <SystemPromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}; 