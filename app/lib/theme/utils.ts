import { Theme } from './index';

/**
 * Utility functions for working with the theme
 */

/**
 * Get a color value from the theme
 * @param theme The theme object
 * @param color The color name (e.g., 'primary')
 * @param shade The shade (e.g., 500)
 * @returns The color value
 */
export function getColor(theme: Theme, color: string, shade: number | string = 500): string {
  const colorObj = theme.colors[color as keyof typeof theme.colors];
  if (!colorObj) {
    console.warn(`Color "${color}" not found in theme`);
    return '';
  }
  
  const colorValue = colorObj[shade as keyof typeof colorObj];
  if (!colorValue) {
    console.warn(`Shade "${shade}" not found for color "${color}"`);
    return '';
  }
  
  return colorValue as string;
}

/**
 * Get a spacing value from the theme
 * @param theme The theme object
 * @param size The spacing size (e.g., 4)
 * @returns The spacing value
 */
export function getSpacing(theme: Theme, size: number | string): string {
  const spacingValue = theme.spacing[size as keyof typeof theme.spacing];
  if (!spacingValue) {
    console.warn(`Spacing "${size}" not found in theme`);
    return '0';
  }
  
  return spacingValue;
}

/**
 * Get a font size value from the theme
 * @param theme The theme object
 * @param size The font size (e.g., 'lg')
 * @returns The font size value
 */
export function getFontSize(theme: Theme, size: string): string {
  const fontSize = theme.typography.fontSize[size as keyof typeof theme.typography.fontSize];
  if (!fontSize) {
    console.warn(`Font size "${size}" not found in theme`);
    return theme.typography.fontSize.base;
  }
  
  return fontSize;
}

/**
 * Get a border radius value from the theme
 * @param theme The theme object
 * @param size The border radius size (e.g., 'md')
 * @returns The border radius value
 */
export function getBorderRadius(theme: Theme, size: string = 'DEFAULT'): string {
  const radius = theme.borderRadius[size as keyof typeof theme.borderRadius];
  if (!radius) {
    console.warn(`Border radius "${size}" not found in theme`);
    return theme.borderRadius.DEFAULT;
  }
  
  return radius;
}

/**
 * Get a box shadow value from the theme
 * @param theme The theme object
 * @param size The box shadow size (e.g., 'md')
 * @returns The box shadow value
 */
export function getBoxShadow(theme: Theme, size: string = 'DEFAULT'): string {
  const shadow = theme.boxShadow[size as keyof typeof theme.boxShadow];
  if (!shadow) {
    console.warn(`Box shadow "${size}" not found in theme`);
    return theme.boxShadow.DEFAULT;
  }
  
  return shadow;
}

/**
 * Get a CSS variable reference for a color
 * @param color The color name (e.g., 'primary')
 * @param shade The shade (e.g., 500)
 * @returns The CSS variable reference (e.g., 'var(--color-primary-500)')
 */
export function cssVar(color: string, shade: number | string): string {
  return `var(--color-${color}-${shade})`;
}

/**
 * Create a responsive style object based on breakpoints
 * @param theme The theme object
 * @param styles The styles object with breakpoint keys
 * @returns The responsive style object
 */
export function responsive(theme: Theme, styles: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  // Base styles (no media query)
  if (styles.base) {
    Object.assign(result, styles.base);
  }
  
  // Breakpoint styles
  Object.entries(theme.breakpoints).forEach(([breakpoint, value]) => {
    if (styles[breakpoint]) {
      result[`@media (min-width: ${value})`] = styles[breakpoint];
    }
  });
  
  return result;
}

/**
 * Create a gradient string
 * @param direction The gradient direction
 * @param stops The gradient color stops
 * @returns The gradient string
 */
export function createGradient(
  direction: string = 'to right',
  stops: Array<[string, string]>
): string {
  const stopsString = stops.map(([color, position]) => `${color} ${position}`).join(', ');
  return `linear-gradient(${direction}, ${stopsString})`;
}

/**
 * Create a space-inspired gradient
 * @param theme The theme object
 * @returns The gradient string
 */
export function createSpaceGradient(theme: Theme): string {
  return createGradient('to bottom right', [
    [getColor(theme, 'primary', 900), '0%'],
    [getColor(theme, 'secondary', 800), '50%'],
    [getColor(theme, 'primary', 700), '100%']
  ]);
}

/**
 * Create a nebula-inspired gradient
 * @param theme The theme object
 * @returns The gradient string
 */
export function createNebulaGradient(theme: Theme): string {
  return createGradient('135deg', [
    [getColor(theme, 'secondary', 900), '0%'],
    [getColor(theme, 'secondary', 700), '25%'],
    [getColor(theme, 'primary', 800), '50%'],
    [getColor(theme, 'accent', 700), '75%'],
    [getColor(theme, 'secondary', 800), '100%']
  ]);
}