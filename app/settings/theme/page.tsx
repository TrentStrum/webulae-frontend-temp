'use client';

import React from 'react';
import { ThemeSelector } from '@/app/components/ui/theme-selector';
import { ThemePreview } from '@/app/components/ui/theme-preview';

export default function ThemeSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Theme Settings</h1>
      <p className="text-muted-foreground">Customize the appearance of your Webulae workspace.</p>
      
      <div className="grid grid-cols-1 gap-8">
        <ThemeSelector />
        <ThemePreview />
      </div>
    </div>
  );
}