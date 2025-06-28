'use client';

import React from 'react';
import { useColorMode } from '@/app/lib/theme/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeCard } from '@/app/components/ui/theme-card';
import { Typography } from '@/app/lib/theme/components/Typography';

export function ThemeSelector() {
  const { colorMode, setColorMode } = useColorMode();
  
  const themes = [
    {
      name: 'Light',
      value: 'light',
      colors: {
        primary: '#0087FF',
        secondary: '#9900FF',
        accent: '#00FFBF',
        background: '#FFFFFF',
        foreground: '#1F2933',
      },
    },
    {
      name: 'Dark',
      value: 'dark',
      colors: {
        primary: '#339FFF',
        secondary: '#AD33FF',
        accent: '#33FFCC',
        background: '#000000',
        foreground: '#FFFFFF',
      },
    },
    {
      name: 'System',
      value: 'system',
      colors: {
        primary: '#0087FF',
        secondary: '#9900FF',
        accent: '#00FFBF',
        background: '#F5F7FA',
        foreground: '#1F2933',
      },
    },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Typography variant="body1">
          Choose a theme for your workspace. You can select light mode, dark mode, or follow your system preferences.
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.value}
              themeName={theme.name}
              colors={theme.colors}
              isActive={colorMode === theme.value}
              onClick={() => setColorMode(theme.value as 'light' | 'dark' | 'system')}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}