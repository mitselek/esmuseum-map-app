/**
 * Task priority type definitions
 * Feature: 027-add-taskprioritybadge-component
 */

/**
 * Task priority levels
 * Used to categorize and display task urgency
 */
export type TaskPriority = 'low' | 'medium' | 'high'

/**
 * Priority badge size variants for Naive UI n-tag
 * Controls the visual size of the priority badge display
 */
export type PriorityBadgeSize = 'small' | 'medium' | 'large'

/**
 * Naive UI tag types for priority color mapping
 * Internal type used for mapping priority levels to Naive UI theme colors
 */
export type PriorityTagType = 'success' | 'warning' | 'error'
