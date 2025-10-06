/**
 * Contract for TaskPriorityBadge Component
 * Feature: 027-add-taskprioritybadge-component
 * 
 * This contract defines the TypeScript interface for the TaskPriorityBadge component.
 */

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high'

/**
 * Priority badge size variants
 */
export type PriorityBadgeSize = 'small' | 'medium' | 'large'

/**
 * Props interface for TaskPriorityBadge component
 */
export interface TaskPriorityBadgeProps {
  /**
   * Priority level to display
   * Maps to Naive UI tag types: low=success(green), medium=warning(yellow), high=error(red)
   */
  priority: TaskPriority
  
  /**
   * Optional badge size
   * @default 'small'
   */
  size?: PriorityBadgeSize
}

/**
 * TaskPriorityBadge component emits no events
 */
export interface TaskPriorityBadgeEmits {
  // This component is purely presentational and emits no events
}

/**
 * Naive UI tag type mapping for priorities
 * Internal use only - not exported from component
 */
export type PriorityTagType = 'success' | 'warning' | 'error'

/**
 * Priority display text mapping
 * Internal use only - not exported from component
 */
export const PRIORITY_DISPLAY_MAP: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const

/**
 * Priority to Naive UI tag type mapping
 * Internal use only - not exported from component
 */
export const PRIORITY_TAG_TYPE_MAP: Record<TaskPriority, PriorityTagType> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
} as const
