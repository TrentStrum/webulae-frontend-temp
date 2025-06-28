import { createContext, useContext } from 'react';

// Define color palette with 100-900 shades
export const colors = {
  primary: {
    100: '#E6F3FF', // Deep space blues - lightest
    200: '#CCE7FF',
    300: '#99CFFF',
    400: '#66B7FF',
    500: '#339FFF',
    600: '#0087FF',
    700: '#0066CC',
    800: '#004399',
    900: '#001B3D'  // Deep space blues - darkest
  },
  secondary: {
    100: '#F5E6FF', // Nebula purples - lightest
    200: '#EBCCFF',
    300: '#D699FF',
    400: '#C266FF',
    500: '#AD33FF',
    600: '#9900FF',
    700: '#7700CC',
    800: '#550099',
    900: '#2D0066'  // Nebula purples - darkest
  },
  accent: {
    100: '#E6FFF9', // Cosmic teals - lightest
    200: '#CCFFF3',
    300: '#99FFE6',
    400: '#66FFD9',
    500: '#33FFCC',
    600: '#00FFBF',
    700: '#00CC99',
    800: '#009973',
    900: '#003D34'  // Cosmic teals - darkest
  },
  neutral: {
    100: '#FFFFFF', // Cool greys - lightest
    200: '#F5F7FA',
    300: '#E4E7EB',
    400: '#CBD2D9',
    500: '#9AA5B1',
    600: '#7B8794',
    700: '#616E7C',
    800: '#3E4C59',
    900: '#1F2933',
    950: '#000000'  // Cool greys - darkest
  },
  success: {
    100: '#E3F9E5',
    500: '#31C48D',
    900: '#014D40'
  },
  warning: {
    100: '#FFF8E6',
    500: '#FFAB00',
    900: '#7A4100'
  },
  error: {
    100: '#FFE3E3',
    500: '#F05252',
    900: '#7F1D1D'
  },
  info: {
    100: '#E3F2FD',
    500: '#2196F3',
    900: '#0D47A1'
  }
};

// Typography system
export const typography = {
  fontFamily: {
    primary: 'var(--font-primary)',
    secondary: 'var(--font-secondary)',
    mono: 'var(--font-mono)'
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '4rem',     // 64px
    '7xl': '5rem',     // 80px
    '8xl': '6rem'      // 96px
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// Spacing system
export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  px: '1px'
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// Box shadows
export const boxShadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

// Transitions
export const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms'
  },
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Breakpoints (mobile-first)
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Container widths
export const containers = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto'
};

// Theme interface
export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  boxShadow: typeof boxShadow;
  transitions: typeof transitions;
  breakpoints: typeof breakpoints;
  containers: typeof containers;
  zIndex: typeof zIndex;
  mode: 'light' | 'dark';
}

// Light theme
export const lightTheme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  transitions,
  breakpoints,
  containers,
  zIndex,
  mode: 'light'
};

// Dark theme
export const darkTheme: Theme = {
  ...lightTheme,
  mode: 'dark'
};

// Create theme context
export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}>({
  theme: lightTheme,
  setTheme: () => {}
});

// Theme hook
export const useTheme = () => useContext(ThemeContext);

// Export default theme
export default lightTheme;