/**
 * Date manipulation utilities
 */

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Get the start of a day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of a month
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a month
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of a year
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a year
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Get the difference in days between two dates
 */
export function diffInDays(dateA: Date, dateB: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.floor((utcB - utcA) / millisecondsPerDay);
}

/**
 * Format a date range
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).format(startDate);
  
  const end = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(endDate);
  
  return `${start} - ${end}`;
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (Math.abs(diffSec) < 60) {
    return diffSec >= 0 ? 'just now' : 'just now';
  }
  
  if (Math.abs(diffMin) < 60) {
    return diffMin >= 0 
      ? `in ${diffMin} minute${diffMin === 1 ? '' : 's'}` 
      : `${Math.abs(diffMin)} minute${Math.abs(diffMin) === 1 ? '' : 's'} ago`;
  }
  
  if (Math.abs(diffHour) < 24) {
    return diffHour >= 0 
      ? `in ${diffHour} hour${diffHour === 1 ? '' : 's'}` 
      : `${Math.abs(diffHour)} hour${Math.abs(diffHour) === 1 ? '' : 's'} ago`;
  }
  
  return diffDay >= 0 
    ? `in ${diffDay} day${diffDay === 1 ? '' : 's'}` 
    : `${Math.abs(diffDay)} day${Math.abs(diffDay) === 1 ? '' : 's'} ago`;
}