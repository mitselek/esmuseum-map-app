<template>
  <n-tag
    v-if="priority"
    :type="tagType"
    :size="size || 'small'"
    :aria-label="`Priority: ${priority}`"
  >
    {{ displayText }}
  </n-tag>
</template>

<script setup lang="ts">
/**
 * TaskPriorityBadge Component
 *
 * Displays a color-coded badge representing task priority level.
 * Uses Naive UI's n-tag component for consistent theming.
 *
 * @example
 * ```vue
 * <TaskPriorityBadge priority="high" />
 * <TaskPriorityBadge priority="medium" size="large" />
 * ```
 *
 * Color Mapping:
 * - low: Green (success)
 * - medium: Yellow (warning)
 * - high: Red (error)
 */

import { computed } from 'vue'
import type { TaskPriority, PriorityBadgeSize, PriorityTagType } from '../../types/priority'

interface Props {
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

const props = defineProps<Props>()

/**
 * Map priority level to Naive UI tag type for color theming
 */
const tagType = computed<PriorityTagType>(() => {
  const typeMap: Record<TaskPriority, PriorityTagType> = {
    low: 'success',
    medium: 'warning',
    high: 'error'
  }
  return typeMap[props.priority]
})

/**
 * Map priority level to human-readable display text
 */
const displayText = computed<string>(() => {
  const textMap: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  }
  return textMap[props.priority]
})
</script>
