'use client';

import React from 'react';
import { useTheme } from './index';
import { Global, css } from '@emotion/react';

export function GlobalStyles() {
  const { theme } = useTheme();
  
  return (
    <Global
      styles={css`
        :root {
          /* Base colors */
          --color-background: ${theme.mode === 'dark' ? theme.colors.neutral[900] : theme.colors.neutral[100]};
          --color-foreground: ${theme.mode === 'dark' ? theme.colors.neutral[100] : theme.colors.neutral[900]};
          
          /* Primary colors */
          --color-primary: ${theme.colors.primary[600]};
          --color-primary-foreground: ${theme.colors.neutral[100]};
          
          /* Secondary colors */
          --color-secondary: ${theme.colors.secondary[600]};
          --color-secondary-foreground: ${theme.colors.neutral[100]};
          
          /* Accent colors */
          --color-accent: ${theme.colors.accent[600]};
          --color-accent-foreground: ${theme.colors.neutral[100]};
          
          /* Neutral colors */
          --color-muted: ${theme.mode === 'dark' ? theme.colors.neutral[800] : theme.colors.neutral[200]};
          --color-muted-foreground: ${theme.mode === 'dark' ? theme.colors.neutral[400] : theme.colors.neutral[600]};
          
          /* Border colors */
          --color-border: ${theme.mode === 'dark' ? theme.colors.neutral[700] : theme.colors.neutral[300]};
          
          /* Status colors */
          --color-success: ${theme.colors.success[500]};
          --color-warning: ${theme.colors.warning[500]};
          --color-error: ${theme.colors.error[500]};
          --color-info: ${theme.colors.info[500]};
          
          /* Status color variants */
          --color-error-100: ${theme.mode === 'dark' ? theme.colors.error[800] : theme.colors.error[100]};
          --color-error-800: ${theme.mode === 'dark' ? theme.colors.error[100] : theme.colors.error[800]};
          
          /* Typography */
          --font-primary: ${theme.typography.fontFamily.primary};
          --font-secondary: ${theme.typography.fontFamily.secondary};
          --font-mono: ${theme.typography.fontFamily.mono};
          
          /* Border radius */
          --radius: ${theme.borderRadius.DEFAULT};
          --radius-sm: ${theme.borderRadius.sm};
          --radius-md: ${theme.borderRadius.md};
          --radius-lg: ${theme.borderRadius.lg};
          --radius-xl: ${theme.borderRadius.xl};
          --radius-2xl: ${theme.borderRadius['2xl']};
          --radius-full: ${theme.borderRadius.full};
          
          /* Transitions */
          --transition-fast: ${theme.transitions.duration[150]};
          --transition-normal: ${theme.transitions.duration[300]};
          --transition-slow: ${theme.transitions.duration[500]};
          --transition-timing: ${theme.transitions.timing.inOut};
        }
        
        /* Base styles */
        html,
        body {
          background-color: var(--color-background);
          color: var(--color-foreground);
          font-family: var(--font-primary);
          line-height: ${theme.typography.lineHeight.normal};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Space-inspired background for light theme */
        ${theme.mode === 'light' && `
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(
              circle at 80% 10%,
              ${theme.colors.primary[100]} 0%,
              transparent 60%
            );
            z-index: -1;
            opacity: 0.6;
            pointer-events: none;
          }
        `}
        
        /* Deep space background for dark theme */
        ${theme.mode === 'dark' && `
          body {
            background-color: ${theme.colors.neutral[950]};
            background-image: 
              radial-gradient(circle at 15% 50%, ${theme.colors.secondary[900]}88 0%, transparent 25%),
              radial-gradient(circle at 85% 30%, ${theme.colors.primary[900]}88 0%, transparent 25%);
          }
        `}
        
        /* Headings */
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-primary);
          font-weight: ${theme.typography.fontWeight.bold};
          line-height: ${theme.typography.lineHeight.tight};
          margin-bottom: ${theme.spacing[4]};
        }
        
        h1 {
          font-size: ${theme.typography.fontSize['4xl']};
        }
        
        h2 {
          font-size: ${theme.typography.fontSize['3xl']};
        }
        
        h3 {
          font-size: ${theme.typography.fontSize['2xl']};
        }
        
        h4 {
          font-size: ${theme.typography.fontSize.xl};
        }
        
        h5 {
          font-size: ${theme.typography.fontSize.lg};
        }
        
        h6 {
          font-size: ${theme.typography.fontSize.base};
        }
        
        /* Links */
        a {
          color: var(--color-primary);
          text-decoration: none;
          transition: color ${theme.transitions.duration[150]} ${theme.transitions.timing.inOut};
        }
        
        a:hover {
          color: ${theme.mode === 'dark' ? theme.colors.primary[400] : theme.colors.primary[700]};
        }
        
        /* Focus styles */
        :focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
        
        /* Selection styles */
        ::selection {
          background-color: ${theme.colors.primary[200]};
          color: ${theme.colors.primary[900]};
        }
      `}
    />
  );
}