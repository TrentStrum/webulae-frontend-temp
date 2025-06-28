'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect } from 'react'

export const theme = {
  colors: {
    primary: {
      100: 'hsl(210,100%,98%)',
      200: 'hsl(210,100%,89.5%)',
      300: 'hsl(210,100%,81%)',
      400: 'hsl(210,100%,72.5%)',
      500: 'hsl(210,100%,64%)',
      600: 'hsl(210,100%,55.5%)',
      700: 'hsl(210,100%,47%)',
      800: 'hsl(210,100%,38.5%)',
      900: 'hsl(210,100%,30%)',
    },
    secondary: {
      100: 'hsl(160,60%,98%)',
      200: 'hsl(160,60%,89.5%)',
      300: 'hsl(160,60%,81%)',
      400: 'hsl(160,60%,72.5%)',
      500: 'hsl(160,60%,64%)',
      600: 'hsl(160,60%,55.5%)',
      700: 'hsl(160,60%,47%)',
      800: 'hsl(160,60%,38.5%)',
      900: 'hsl(160,60%,30%)',
    },
    accent: {
      100: 'hsl(280,70%,98%)',
      200: 'hsl(280,70%,89.5%)',
      300: 'hsl(280,70%,81%)',
      400: 'hsl(280,70%,72.5%)',
      500: 'hsl(280,70%,64%)',
      600: 'hsl(280,70%,55.5%)',
      700: 'hsl(280,70%,47%)',
      800: 'hsl(280,70%,38.5%)',
      900: 'hsl(280,70%,30%)',
    },
    neutrals: {
      white: {
        100: 'hsl(0,0%,100%)',
        200: 'hsl(0,0%,98.75%)',
        300: 'hsl(0,0%,97.5%)',
        400: 'hsl(0,0%,96.25%)',
        500: 'hsl(0,0%,95%)',
        600: 'hsl(0,0%,93.75%)',
        700: 'hsl(0,0%,92.5%)',
        800: 'hsl(0,0%,91.25%)',
        900: 'hsl(0,0%,90%)',
      },
      grey: {
        100: 'hsl(0,0%,95%)',
        200: 'hsl(0,0%,85.625%)',
        300: 'hsl(0,0%,76.25%)',
        400: 'hsl(0,0%,66.875%)',
        500: 'hsl(0,0%,57.5%)',
        600: 'hsl(0,0%,48.125%)',
        700: 'hsl(0,0%,38.75%)',
        800: 'hsl(0,0%,29.375%)',
        900: 'hsl(0,0%,20%)',
      },
      black: {
        100: 'hsl(0,0%,10%)',
        200: 'hsl(0,0%,8.75%)',
        300: 'hsl(0,0%,7.5%)',
        400: 'hsl(0,0%,6.25%)',
        500: 'hsl(0,0%,5%)',
        600: 'hsl(0,0%,3.75%)',
        700: 'hsl(0,0%,2.5%)',
        800: 'hsl(0,0%,1.25%)',
        900: 'hsl(0,0%,0%)',
      },
    },
  },
  fonts: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
    lineHeights: {
      normal: '1.5',
      relaxed: '1.75',
    },
  },
}

function applyTheme() {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  // brand colors
  for (const [family, shades] of Object.entries(theme.colors)) {
    if (family === 'neutrals') continue
    for (const [tone, value] of Object.entries(shades as Record<string,string>)) {
      root.style.setProperty(`--${family}-${tone}`, value)
    }
  }

  // neutral colors
  for (const [name, shades] of Object.entries(theme.colors.neutrals)) {
    for (const [tone, value] of Object.entries(shades as Record<string,string>)) {
      root.style.setProperty(`--${name}-${tone}`, value)
    }
  }

  root.style.setProperty('--font-sans', theme.fonts.sans)
  root.style.setProperty('--font-mono', theme.fonts.mono)
  for (const [k,v] of Object.entries(theme.fonts.weights)) {
    root.style.setProperty(`--font-weight-${k}`, v.toString())
  }
  for (const [k,v] of Object.entries(theme.fonts.lineHeights)) {
    root.style.setProperty(`--line-height-${k}`, v.toString())
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme()
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
