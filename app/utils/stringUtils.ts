/**
 * String manipulation utilities
 */

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/&/g, '-and-')   // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Capitalize the first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Check if a string contains another string (case insensitive)
 */
export function containsText(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.toLowerCase());
}

/**
 * Mask a string (e.g., for sensitive data)
 */
export function maskString(text: string, visibleChars = 4, mask = '*'): string {
  if (text.length <= visibleChars) return text;
  
  const visible = text.slice(-visibleChars);
  const masked = mask.repeat(text.length - visibleChars);
  
  return masked + visible;
}

/**
 * Normalize a string by removing diacritics
 */
export function normalizeString(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Extract the first paragraph from a text
 */
export function extractFirstParagraph(text: string): string {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs[0].trim();
}

/**
 * Create an excerpt from a longer text
 */
export function createExcerpt(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  
  // Try to cut at a space to avoid cutting words
  const cutoff = text.lastIndexOf(' ', maxLength);
  const excerpt = text.substring(0, cutoff > 0 ? cutoff : maxLength);
  
  return `${excerpt}...`;
}