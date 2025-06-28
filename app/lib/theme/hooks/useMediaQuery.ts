'use client';

import { useState, useEffect } from 'react';
import { breakpoints } from '../index';

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to check if the current viewport matches a media query
 * @param query The media query to check
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);
  
  return matches;
}

/**
 * Hook to check if the current viewport is at least a certain breakpoint
 * @param breakpoint The breakpoint to check
 * @returns Whether the viewport is at least the specified breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${breakpoints[breakpoint]})`;
  return useMediaQuery(query);
}

/**
 * Hook to get the current breakpoint
 * @returns The current breakpoint
 */
export function useCurrentBreakpoint(): Breakpoint {
  const isXs = useMediaQuery(`(min-width: ${breakpoints.xs})`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md})`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl})`);
  const is2xl = useMediaQuery(`(min-width: ${breakpoints['2xl']})`);
  
  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  if (isXs) return 'xs';
  
  // Default to the smallest breakpoint
  return 'xs';
}