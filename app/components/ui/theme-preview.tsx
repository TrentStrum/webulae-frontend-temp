'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/app/lib/theme/components/Badge';
import { Typography } from '@/app/lib/theme/components/Typography';
import { useTheme } from '@/app/lib/theme';

export function ThemePreview() {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Typography */}
          <div className="space-y-4">
            <Typography variant="h3" color="primary-700">Typography</Typography>
            <div className="space-y-2">
              <Typography variant="h1" noMargin>Heading 1</Typography>
              <Typography variant="h2" noMargin>Heading 2</Typography>
              <Typography variant="h3" noMargin>Heading 3</Typography>
              <Typography variant="h4" noMargin>Heading 4</Typography>
              <Typography variant="h5" noMargin>Heading 5</Typography>
              <Typography variant="h6" noMargin>Heading 6</Typography>
              <Typography variant="body1" noMargin>Body 1 - Regular paragraph text</Typography>
              <Typography variant="body2" noMargin>Body 2 - Smaller paragraph text</Typography>
              <Typography variant="caption" noMargin>Caption - Small text for captions</Typography>
              <Typography variant="overline" noMargin>OVERLINE - UPPERCASE TEXT</Typography>
            </div>
          </div>
          
          {/* Colors */}
          <div className="space-y-4">
            <Typography variant="h3" color="primary-700">Colors</Typography>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(theme.colors.primary).map(([shade, color]) => (
                <div 
                  key={`primary-${shade}`}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">Primary {shade}</span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(theme.colors.secondary).map(([shade, color]) => (
                <div 
                  key={`secondary-${shade}`}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">Secondary {shade}</span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(theme.colors.accent).map(([shade, color]) => (
                <div 
                  key={`accent-${shade}`}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">Accent {shade}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Components */}
          <div className="space-y-4">
            <Typography variant="h3" color="primary-700">Components</Typography>
            
            {/* Buttons */}
            <div className="space-y-2">
              <Typography variant="subtitle1" noMargin>Buttons</Typography>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            
            {/* Inputs */}
            <div className="space-y-2">
              <Typography variant="subtitle1" noMargin>Inputs</Typography>
              <div className="flex flex-col gap-2 max-w-md">
                <Input placeholder="Default input" />
                <Input placeholder="Disabled input" disabled />
              </div>
            </div>
            
            {/* Badges */}
            <div className="space-y-2">
              <Typography variant="subtitle1" noMargin>Badges</Typography>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
            
            {/* Cards */}
            <div className="space-y-2">
              <Typography variant="subtitle1" noMargin>Cards</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This is a basic card component with a header and content.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700">
                  <CardHeader>
                    <CardTitle>Themed Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This card has custom theme colors applied.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}