/**
 * Date formatting utilities
 * Respects browser locale for consistent internationalization
 */

/**
 * Format date to localized string
 * @param date Date string or Date object
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string | null {
  if (!date) return null
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Default options for short date format
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }
    
    return dateObj.toLocaleDateString(undefined, options || defaultOptions)
  }
  catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
}

/**
 * Format date with time
 * @param date Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string | null {
  if (!date) return null
  
  return formatDate(date, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format date in long format (e.g., "19. september 2025")
 * @param date Date string or Date object
 * @returns Formatted long date string
 */
export function formatDateLong(
  date: string | Date | null | undefined
): string | null {
  if (!date) return null
  
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * @param date Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: string | Date | null | undefined
): string | null {
  if (!date) return null
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = dateObj.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (Math.abs(diffDays) === 0) {
      return 'Täna' // Today
    }
    else if (diffDays === 1) {
      return 'Homme' // Tomorrow
    }
    else if (diffDays === -1) {
      return 'Eile' // Yesterday
    }
    else if (diffDays > 0) {
      return `${diffDays} päeva pärast`
    }
    else {
      return `${Math.abs(diffDays)} päeva tagasi`
    }
  }
  catch (error) {
    console.error('Error formatting relative time:', error)
    return null
  }
}
