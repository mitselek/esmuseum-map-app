/**
 * Composable for tracking user's completed tasks
 * 
 * MIGRATED TO TYPESCRIPT (F022)
 * - Added proper type annotations
 * - Uses EntuResponse type from types/entu.ts
 * - Type-safe entity property access
 */

import type { Ref, ComputedRef } from 'vue'
import type { EntuResponse } from '../../types/entu'

interface TaskStats {
  actual: number
  expected: number
  progress: number
}

interface UseCompletedTasksReturn {
  completedTaskIds: ComputedRef<string[]>
  userResponses: ComputedRef<EntuResponse[]>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  loadCompletedTasks: () => Promise<string[]>
  getTaskStats: (taskId: string, expectedCount: number) => TaskStats
}

export const useCompletedTasks = (): UseCompletedTasksReturn => {
  const { token } = useEntuAuth()

  // Cache for completed task IDs and all user responses
  const completedTaskIds = ref<Set<string>>(new Set())
  const userResponses = ref<EntuResponse[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

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

      console.log(`[useCompletedTasks] Loaded ${responses.length} responses for ${completedTaskIds.value.size} unique tasks`)

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

  return {
    completedTaskIds: computed(() => Array.from(completedTaskIds.value)),
    userResponses: computed(() => userResponses.value),
    loading: readonly(loading),
    error: readonly(error),
    loadCompletedTasks,
    getTaskStats
  }
}
