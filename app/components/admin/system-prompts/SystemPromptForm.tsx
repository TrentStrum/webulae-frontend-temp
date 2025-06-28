'use client';

import React, { useState } from 'react';
import { SystemPrompt, CreateSystemPromptRequest, UpdateSystemPromptRequest, SYSTEM_PROMPT_CATEGORIES } from '@/app/types/systemPrompt.types';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface SystemPromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSystemPromptRequest | UpdateSystemPromptRequest) => void;
  initialData?: SystemPrompt;
  title: string;
  description: string;
  submitLabel: string;
  isLoading?: boolean;
  hasActivePrompt?: boolean;
}

export const SystemPromptForm: React.FC<SystemPromptFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  submitLabel,
  isLoading = false,
  hasActivePrompt = false,
}) => {
  const [formData, setFormData] = React.useState<CreateSystemPromptRequest>({
    prompt_name: '',
    content: '',
    category: 'General',
    priority: 1,
    is_active: true,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        prompt_name: initialData.prompt_name,
        content: initialData.content,
        category: initialData.category,
        priority: initialData.priority,
        is_active: initialData.is_active,
      });
    } else {
      setFormData({
        prompt_name: '',
        content: '',
        category: 'General',
        priority: 1,
        is_active: true,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt_name.trim() || !formData.content.trim()) {
      return;
    }
    onSubmit(formData);
  };

  const showActiveWarning = formData.is_active && hasActivePrompt && !initialData?.is_active;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.prompt_name}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt_name: e.target.value }))}
              placeholder="Enter prompt name..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter the system prompt content..."
              rows={6}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_PROMPT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={formData.priority.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
              >
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
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
            {showActiveWarning && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Activating this prompt will automatically deactivate the currently active system prompt. 
                  Only one system prompt can be active at a time.
                </AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Only one system prompt can be active at a time. The active prompt guides the AI agent's behavior.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 