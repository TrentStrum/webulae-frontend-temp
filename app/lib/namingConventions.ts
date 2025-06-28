/**
 * Naming Conventions Utility
 * 
 * This file defines standard naming conventions for the application.
 * Use these functions to ensure consistent naming across the codebase.
 */

/**
 * Convert a string to camelCase
 * Example: "user profile" -> "userProfile"
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Convert a string to PascalCase
 * Example: "user profile" -> "UserProfile"
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Convert a string to kebab-case
 * Example: "userProfile" -> "user-profile"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert a string to snake_case
 * Example: "userProfile" -> "user_profile"
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert a string to SCREAMING_SNAKE_CASE
 * Example: "userProfile" -> "USER_PROFILE"
 */
export function toScreamingSnakeCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

/**
 * Convert a string to Title Case
 * Example: "user profile" -> "User Profile"
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a consistent file name based on the component name
 * Example: "UserProfile" -> "user-profile.tsx"
 */
export function toFileName(componentName: string, extension = 'tsx'): string {
  return `${toKebabCase(componentName)}.${extension}`;
}

/**
 * Generate a consistent test file name based on the component name
 * Example: "UserProfile" -> "user-profile.test.tsx"
 */
export function toTestFileName(componentName: string): string {
  return `${toKebabCase(componentName)}.test.tsx`;
}

/**
 * Generate a consistent component name from a file path
 * Example: "/components/user-profile.tsx" -> "UserProfile"
 */
export function filePathToComponentName(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  const baseName = fileName.split('.')[0];
  return toPascalCase(baseName);
}