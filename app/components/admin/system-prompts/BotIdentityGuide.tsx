'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { IconRobot, IconInfoCircle, IconCopy } from '@tabler/icons-react';

interface BotIdentityGuideProps {
  onAddBotIdentity?: () => void;
}

export const BotIdentityGuide: React.FC<BotIdentityGuideProps> = ({ onAddBotIdentity }) => {
  const examplePrompts = [
    {
      title: "Bot Name",
      content: "Your name is Jovian Assistant. When users ask who you are, introduce yourself as Jovian Assistant.",
      category: "Bot Identity"
    },
    {
      title: "Personality & Tone", 
      content: "You are professional, helpful, and knowledgeable. Always maintain a friendly yet authoritative tone. Be concise but thorough in your responses.",
      category: "Bot Identity"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <IconRobot className="h-5 w-5" />
          Bot Identity Setup Guide
        </CardTitle>
        <CardDescription className="text-blue-700">
          Configure your AI assistant's name and personality using System Prompts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <IconInfoCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-800 text-sm mb-3">
              Use the <Badge variant="outline" className="text-xs">Bot Identity</Badge> category to set your assistant's name and personality. 
              These settings will be applied to all chat interactions.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-blue-900">Example Bot Identity Prompts:</h4>
          {examplePrompts.map((prompt, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-blue-900">{prompt.title}</span>
                <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
              </div>
              <p className="text-sm text-gray-700 mb-2">{prompt.content}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(prompt.content)}
                className="h-6 px-2 text-xs"
              >
                <IconCopy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          ))}
        </div>

        {onAddBotIdentity && (
          <div className="pt-2">
            <Button onClick={onAddBotIdentity} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <IconRobot className="h-4 w-4 mr-2" />
              Add Bot Identity Prompt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 