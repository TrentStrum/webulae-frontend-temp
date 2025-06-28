'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/app/lib/theme';
import { Check } from 'lucide-react';

interface ThemeCardProps {
  themeName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  isActive?: boolean;
  onClick?: () => void;
}

export function ThemeCard({ themeName, colors, isActive, onClick }: ThemeCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 z-10">
        {isActive && (
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div 
        className="h-24 w-full" 
        style={{ 
          background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary}, ${colors.accent})` 
        }}
      />
      
      <CardContent className="pt-4">
        <h3 className="font-medium mb-2">{themeName}</h3>
        
        <div className="flex gap-2 mb-3">
          {Object.entries(colors).map(([name, color]) => (
            <div 
              key={name}
              className="h-6 w-6 rounded-full border"
              style={{ backgroundColor: color }}
              title={name}
            />
          ))}
        </div>
        
        <div 
          className="p-2 rounded text-xs"
          style={{ 
            backgroundColor: colors.background,
            color: colors.foreground
          }}
        >
          Sample Text
        </div>
      </CardContent>
    </Card>
  );
}