'use client';

import { useTheme } from '../index';
import { useEffect } from 'react';

/**
 * Hook to get and set the color mode
 * @returns Object with the current color mode and functions to change it
 */
export function useColorMode() {
  const { theme, setTheme } = useTheme();
  
  // Set the color mode
  const setColorMode = (mode: 'light' | 'dark' | 'system') => {
    setTheme(mode);
  };
  
  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setTheme(theme.mode === 'dark' ? 'light' : 'dark');
  };
  
  // Update the document class when the theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme.mode]);
  
  return {
    colorMode: theme.mode,
    setColorMode,
    toggleColorMode,
    isDark: theme.mode === 'dark',
    isLight: theme.mode === 'light'
  };
}