'use client';

import React from 'react';
import { SystemPrompt } from '@/app/types/systemPrompt.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Edit, Trash2, MessageSquare, Star } from 'lucide-react';

interface SystemPromptCardProps {
  prompt: SystemPrompt;
  onEdit: (prompt: SystemPrompt) => void;
  onDelete: (prompt: SystemPrompt) => void;
}

const getPriorityColor = (priority: number) => {
  if (priority <= 3) return 'bg-red-100 text-red-800';
  if (priority <= 6) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

export const SystemPromptCard: React.FC<SystemPromptCardProps> = ({
  prompt,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${prompt.is_active ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {prompt.is_active ? (
                <Star className="h-4 w-4 text-primary fill-primary" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              <Badge variant="secondary" className="text-xs">
                {prompt.category}
              </Badge>
              <Badge className={`text-xs ${getPriorityColor(prompt.priority)}`}>
                Priority {prompt.priority}
              </Badge>
              <Badge variant={prompt.is_active ? "default" : "secondary"} className="text-xs">
                {prompt.is_active ? "Active" : "Inactive"}
              </Badge>
              {prompt.is_active && (
                <Badge variant="outline" className="text-xs border-primary text-primary">
                  System Prompt
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{prompt.prompt_name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(prompt)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(prompt)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">{prompt.content}</p>
      </CardContent>
    </Card>
  );
}; 