/**
 * Composable for tracking user's completed tasks
 * 
 * MIGRATED TO TYPESCRIPT (F022)
 * CONSOLIDATED: Replaced useTaskScoring.js functionality
 * - Added proper type annotations
 * - Uses EntuResponse type from types/entu.ts
 * - Type-safe entity property access
 * - Provides both global (all tasks) and per-task (single task) scoring
 */

import type { Ref, ComputedRef } from 'vue'
import type { EntuResponse } from '../../types/entu'

interface TaskStats {
  actual: number
  expected: number
  progress: number
}

interface UseCompletedTasksReturn {
  // Global state (all tasks)
  completedTaskIds: ComputedRef<string[]>
  userResponses: ComputedRef<EntuResponse[]>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  
  // Methods
  loadCompletedTasks: () => Promise<string[]>
  getTaskStats: (taskId: string, expectedCount: number) => TaskStats
  
  // Per-task scoring (replaces useTaskScoring)
  getVisitedLocationsForTask: (taskId: string) => Set<string>
  isLocationVisited: (taskId: string, locationRef: string) => boolean
}

// Shared state (singleton pattern) - ensures all components use same cache
const completedTaskIds = ref<Set<string>>(new Set())
const userResponses = ref<EntuResponse[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

export const useCompletedTasks = (): UseCompletedTasksReturn => {
  const { token } = useEntuAuth()

  /**
   * Load user's completed tasks from Entu API
   * @returns Array of completed task IDs
   */
  const loadCompletedTasks = async (): Promise<string[]> => {
    if (!token.value) {
      completedTaskIds.value = new Set()
      return []
    }

    const { user } = useEntuAuth()
    const { searchEntities } = useEntuApi()

    // TODO: Type useEntuAuth properly in future
    const userId = (user.value as any)?._id
    if (!userId) {
      console.warn('No user ID available for loading completed tasks')
      return []
    }

    try {
      loading.value = true
      error.value = null

      // Search for user's responses using direct Entu API call
      const responsesResult = await searchEntities({
        '_type.string': 'vastus',
        '_owner.reference': userId,
        limit: 100,
        props: '_parent,asukoht,vastused,esitamisaeg,muutmisaeg,staatus'
      })

      // Type assertion: we know these are response entities
      const responses = (responsesResult.entities || []) as EntuResponse[]
      
      // Store all responses for later stats calculation
      userResponses.value = responses

      // Extract unique task IDs from user responses
      const taskIds: string[] = []
      for (const response of responses) {
        const parentRef = response._parent?.[0]?.reference
        if (parentRef) {
          taskIds.push(parentRef)
        }
      }

      completedTaskIds.value = new Set(taskIds)

      return Array.from(completedTaskIds.value)
    }
    catch (err) {
      console.error('Failed to load completed tasks (client-side):', err)
      error.value = 'Lõpetatud ülesannete laadimine ebaõnnestus'
      return []
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Get task statistics based on unique locations visited
   * @param taskId - The task ID to get stats for
   * @param expectedCount - The expected number of locations (from task.vastuseid)
   * @returns Object with actual, expected, and progress percentage
   */
  const getTaskStats = (taskId: string, expectedCount: number): TaskStats => {
    // Filter responses for this specific task
    const taskResponses = userResponses.value.filter((response) => {
      return response._parent?.[0]?.reference === taskId
    })

    // Count unique locations visited (by asukoht reference)
    const uniqueLocations = new Set<string>()
    for (const response of taskResponses) {
      const locationRef = response.asukoht?.[0]?.reference
      if (locationRef) {
        uniqueLocations.add(locationRef)
      }
    }

    const actual = uniqueLocations.size
    const expected = expectedCount || 1
    const progress = expected > 0 ? Math.round((actual / expected) * 100) : 0

    return { actual, expected, progress }
  }

  /**
   * Get set of visited locations for a specific task
   * @param taskId - The task ID to get visited locations for
   * @returns Set of location references that have been visited for this task
   */
  const getVisitedLocationsForTask = (taskId: string): Set<string> => {
    const taskResponses = userResponses.value.filter((response) => {
      return response._parent?.[0]?.reference === taskId
    })

    const locations = new Set<string>()
    for (const response of taskResponses) {
      const locationRef = response.asukoht?.[0]?.reference
      if (locationRef) {
        locations.add(locationRef)
      }
    }

    return locations
  }

  /**
   * Check if a specific location has been visited for a task
   * @param taskId - The task ID to check
   * @param locationRef - The location reference to check
   * @returns True if the location has been visited for this task
   */
  const isLocationVisited = (taskId: string, locationRef: string): boolean => {
    const visitedLocations = getVisitedLocationsForTask(taskId)
    return visitedLocations.has(locationRef)
  }

  return {
    completedTaskIds: computed(() => Array.from(completedTaskIds.value)),
    userResponses: computed(() => userResponses.value),
    loading: readonly(loading),
    error: readonly(error),
    loadCompletedTasks,
    getTaskStats,
    getVisitedLocationsForTask,
    isLocationVisited
  }
}

/**
 * Legacy compatibility wrapper for useTaskScoring
 * Provides the same interface as the old useTaskScoring.js
 * Uses the consolidated useCompletedTasks cache instead of making separate API calls
 * 
 * @param taskData - Computed ref containing the task object
 * @returns Scoring data with the same interface as old useTaskScoring
 */
export const useTaskScoring = (taskData: ComputedRef<any>) => {
  const completedTasks = useCompletedTasks()
  
  // Extract expected response count from task data
  const expectedResponses = computed(() => {
    if (!taskData?.value?.vastuseid?.[0]?.number) {
      return 0
    }
    return taskData.value.vastuseid[0].number
  })

  // Get task ID from task data
  const taskId = computed(() => taskData?.value?._id || '')

  // Extract unique visited locations from cached responses
  const visitedLocations = computed(() => {
    if (!taskId.value) return new Set()
    return completedTasks.getVisitedLocationsForTask(taskId.value)
  })

  // Calculate scoring (uses cached data, no API calls)
  const uniqueLocationsCount = computed(() => visitedLocations.value.size)
  const totalExpected = computed(() => expectedResponses.value)
  const progressText = computed(() => `${uniqueLocationsCount.value} of ${totalExpected.value}`)
  const progressPercent = computed(() => {
    if (totalExpected.value === 0) return 0
    return Math.round((uniqueLocationsCount.value / totalExpected.value) * 100)
  })

  // Check if a specific location has been visited (uses cached data)
  const isLocationVisited = (locationRef: string): boolean => {
    if (!taskId.value) return false
    return completedTasks.isLocationVisited(taskId.value, locationRef)
  }

  return {
    // State (from consolidated cache)
    userResponses: completedTasks.userResponses,
    loading: completedTasks.loading,
    error: completedTasks.error,

    // Computed scoring data
    uniqueLocationsCount,
    totalExpected,
    progressText,
    progressPercent,
    visitedLocations,

    // Methods
    isLocationVisited
  }
}
