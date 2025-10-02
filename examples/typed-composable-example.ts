/**
 * Example: Migrating useTaskDetail to TypeScript with Entu types
 * 
 * This file demonstrates how to refactor existing composables to use
 * the new TypeScript type system for Entu entities.
 * 
 * Compare with: app/composables/useTaskDetail.js
 */

import type { Ref } from 'vue'
import type { EntuTask } from '../types/entu'
import { 
  getTaskName, 
  getTaskResponseCount,
  getTaskDescription,
  getTaskMapReference,
  getTaskGroupReference,
  getTaskDeadline
} from '../utils/entu-helpers'
import { isTask } from '../types/entu'

/**
 * Example: Typed task detail composable
 * 
 * BEFORE (JavaScript):
 * ```javascript
 * const getTaskTitle = (task) => {
 *   if (typeof task?.name === 'string') {
 *     return task.name || 'Untitled Task'
 *   }
 *   return task?.name?.[0]?.string || 'Untitled Task'
 * }
 * ```
 * 
 * AFTER (TypeScript with helpers):
 * ```typescript
 * const getTaskTitle = (task: EntuTask): string => {
 *   return getTaskName(task) // Always returns string, handles all cases
 * }
 * ```
 */
export const useTypedTaskDetail = () => {
  const { t } = useI18n()
  
  // ========================================================================
  // TYPED HELPER FUNCTIONS
  // ========================================================================
  
  /**
   * Get task title with type safety
   * 
   * BEFORE: Multiple checks for different data structures
   * AFTER: Single helper function, always returns string
   */
  const getTaskTitle = (task: EntuTask): string => {
    // Helper handles Entu array format automatically
    return getTaskName(task) || t('taskDetail.noTitle', 'Untitled Task')
  }
  
  /**
   * Get task description with proper typing
   * 
   * BEFORE: Unclear if description is string or array
   * AFTER: Type-safe, returns string | undefined
   */
  const getTaskDescriptionText = (task: EntuTask): string | null => {
    return getTaskDescription(task) || null
  }
  
  /**
   * Get response count with guaranteed number return
   * 
   * BEFORE: Multiple fallbacks, unclear what type is returned
   * AFTER: Always returns number (0 if not found)
   */
  const getTaskResponseCountValue = (task: EntuTask): number => {
    return getTaskResponseCount(task)
  }
  
  /**
   * Get task deadline as Date object
   * 
   * NEW: Type-safe datetime handling
   */
  const getTaskDeadlineDate = (task: EntuTask): Date | null => {
    return getTaskDeadline(task) || null
  }
  
  /**
   * Get task map reference ID
   * 
   * NEW: Clear what type is returned (string | undefined)
   */
  const getTaskMapId = (task: EntuTask): string | undefined => {
    return getTaskMapReference(task)
  }
  
  /**
   * Get task group reference ID
   * 
   * NEW: Type-safe reference extraction
   */
  const getTaskGroupId = (task: EntuTask): string | undefined => {
    return getTaskGroupReference(task)
  }
  
  // ========================================================================
  // TYPED STATE MANAGEMENT
  // ========================================================================
  
  /**
   * Strongly typed task reference
   * 
   * BEFORE: const task = ref(null)
   * AFTER: TypeScript knows exactly what properties are available
   */
  const currentTask = ref<EntuTask | null>(null)
  
  /**
   * Set current task with type checking
   * 
   * BEFORE: function setTask(task) { ... }
   * AFTER: TypeScript ensures only EntuTask can be passed
   */
  const setCurrentTask = (task: EntuTask | null) => {
    currentTask.value = task
  }
  
  /**
   * Get current task with type safety
   */
  const getCurrentTask = (): EntuTask | null => {
    return currentTask.value
  }
  
  // ========================================================================
  // COMPUTED PROPERTIES WITH TYPES
  // ========================================================================
  
  /**
   * Computed task title
   * TypeScript knows this always returns string
   */
  const taskTitle = computed<string>(() => {
    if (!currentTask.value) return t('taskDetail.noTitle', 'Untitled Task')
    return getTaskTitle(currentTask.value)
  })
  
  /**
   * Computed response count
   * TypeScript knows this always returns number
   */
  const responseCount = computed<number>(() => {
    if (!currentTask.value) return 0
    return getTaskResponseCountValue(currentTask.value)
  })
  
  /**
   * Computed deadline status
   * Clear return type with proper typing
   */
  const deadlineInfo = computed<{
    hasDeadline: boolean
    deadline: Date | null
    isOverdue: boolean
  }>(() => {
    if (!currentTask.value) {
      return { hasDeadline: false, deadline: null, isOverdue: false }
    }
    
    const deadline = getTaskDeadlineDate(currentTask.value)
    const now = new Date()
    
    return {
      hasDeadline: !!deadline,
      deadline,
      isOverdue: deadline ? deadline < now : false
    }
  })
  
  // ========================================================================
  // API INTERACTIONS WITH TYPES
  // ========================================================================
  
  /**
   * Load task with type safety
   * 
   * BEFORE: async function loadTask(taskId) { ... }
   * AFTER: TypeScript ensures correct parameter types and return type
   */
  const loadTask = async (taskId: string): Promise<{
    success: boolean
    task?: EntuTask
    error?: string
  }> => {
    const { getEntity } = useEntuApi()
    
    try {
      // API client should return typed entities
      const task = await getEntity(taskId) as EntuTask
      
      if (!task) {
        return {
          success: false,
          error: 'Task not found'
        }
      }
      
      setCurrentTask(task)
      
      return {
        success: true,
        task
      }
    }
    catch (error) {
      console.error('Failed to load task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Process task data with type guards
   * 
   * NEW: Type guards ensure runtime type safety
   */
  const processTask = (entity: any): boolean => {
    // Type guard checks entity structure at runtime
    if (!isTask(entity)) {
      console.error('Entity is not a task')
      return false
    }
    
    // TypeScript now knows entity is EntuTask
    setCurrentTask(entity)
    return true
  }
  
  // ========================================================================
  // RETURN TYPED API
  // ========================================================================
  
  return {
    // State
    currentTask: readonly(currentTask),
    
    // Computed
    taskTitle,
    responseCount,
    deadlineInfo,
    
    // Helpers
    getTaskTitle,
    getTaskDescriptionText,
    getTaskResponseCountValue,
    getTaskDeadlineDate,
    getTaskMapId,
    getTaskGroupId,
    
    // Actions
    setCurrentTask,
    getCurrentTask,
    loadTask,
    processTask
  }
}

// ============================================================================
// COMPARISON: Before and After
// ============================================================================

/**
 * BEFORE (JavaScript - Fragile):
 * 
 * ```javascript
 * export const useTaskDetail = () => {
 *   const getTaskTitle = (task) => {
 *     // Multiple checks needed
 *     if (typeof task?.name === 'string') {
 *       return task.name || 'Untitled Task'
 *     }
 *     return task?.name?.[0]?.string || 'Untitled Task'
 *   }
 *   
 *   const getResponseCount = (task) => {
 *     // Unclear what structure to expect
 *     if (task?.vastuseid && Array.isArray(task.vastuseid)) {
 *       return task.vastuseid[0]?.number || 0
 *     }
 *     if (typeof task?.responseCount === 'number') {
 *       return task.responseCount
 *     }
 *     return 0
 *   }
 *   
 *   // No type hints, runtime errors possible
 *   const task = ref(null)
 * }
 * ```
 * 
 * Issues:
 * - No autocomplete
 * - Runtime errors if structure changes
 * - Unclear what properties exist
 * - Multiple code paths for same data
 * - No compile-time validation
 */

/**
 * AFTER (TypeScript - Robust):
 * 
 * ```typescript
 * export const useTypedTaskDetail = () => {
 *   const getTaskTitle = (task: EntuTask): string => {
 *     return getTaskName(task)
 *   }
 *   
 *   const getResponseCountValue = (task: EntuTask): number => {
 *     return getTaskResponseCount(task)
 *   }
 *   
 *   // Type-safe state
 *   const task = ref<EntuTask | null>(null)
 * }
 * ```
 * 
 * Benefits:
 * ✅ Full IDE autocomplete
 * ✅ Compile-time error checking
 * ✅ Self-documenting code
 * ✅ Single source of truth
 * ✅ Guaranteed return types
 * ✅ Easy refactoring
 */
