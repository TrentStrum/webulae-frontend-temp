'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeContext, lightTheme, darkTheme } from './index';
import { useTheme as useNextTheme } from 'next-themes';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: 'light' | 'dark' | 'system';
};

export function ThemeProvider({ children }: ThemeProviderProps) {
	const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
	const [mounted, setMounted] = useState(false);

	// After mounting, we have access to the theme
	useEffect(() => {
		setMounted(true);
	}, []);

	// Determine the current theme
	const currentTheme = useMemo(() => {
		if (!mounted) return lightTheme;

		if (
			nextTheme === 'dark' ||
			(nextTheme === 'system' &&
				typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			return darkTheme;
		}

		return lightTheme;
	}, [nextTheme, mounted]);

	// Set theme function
	const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
		setNextTheme(theme);
	}, [setNextTheme]);

	// Context value
	const contextValue = useMemo(
		() => ({
			theme: currentTheme,
			setTheme,
		}),
		[currentTheme, setTheme],
	);

	// Apply CSS variables to :root
	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;

		// Apply color variables
		Object.entries(currentTheme.colors).forEach(([colorName, colorShades]) => {
			if (typeof colorShades === 'object') {
				Object.entries(colorShades).forEach(([shade, value]) => {
					root.style.setProperty(`--color-${colorName}-${shade}`, value);
				});
			}
		});

		// Apply other theme variables
		root.style.setProperty('--font-primary', currentTheme.typography.fontFamily.primary);
		root.style.setProperty('--font-secondary', currentTheme.typography.fontFamily.secondary);
		root.style.setProperty('--font-mono', currentTheme.typography.fontFamily.mono);

		// Apply border radius
		Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
			root.style.setProperty(`--radius${key === 'DEFAULT' ? '' : `-${key}`}`, value);
		});
	}, [currentTheme, mounted]);

	if (!mounted) {
		// Avoid rendering with incorrect theme
		return <>{children}</>;
	}

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
