/**
 * Composable for tracking user's completed tasks
 */
export const useCompletedTasks = () => {
  const { token } = useEntuAuth()

  // Cache for completed task IDs
  const completedTaskIds = ref(new Set())
  const loading = ref(false)
  const error = ref(null)

  /**
   * Load user's completed tasks from Entu API
   */
  const loadCompletedTasks = async () => {
    if (!token.value) {
      completedTaskIds.value = new Set()
      return []
    }

    const { user } = useEntuAuth()
    const { searchEntities } = useEntuApi()

    if (!user.value?._id) {
      console.warn('No user ID available for loading completed tasks')
      return []
    }

    try {
      loading.value = true
      error.value = null

      // Search for user's responses using direct Entu API call
      const responsesResult = await searchEntities({
        '_type.string': 'vastus',
        'kasutaja._id': user.value._id,
        limit: 100,
        props: 'ulesanne,vastused,esitamisaeg,muutmisaeg,staatus'
      })

      const responses = responsesResult.entities || []

      // Extract task IDs from user responses
      const taskIds = responses
        .filter((response) => response.ulesanne?._id)
        .map((response) => response.ulesanne._id)

      completedTaskIds.value = new Set(taskIds)
      
      console.log(`[CLIENT] Loaded ${responses.length} completed tasks for user ${user.value._id}`, {
        taskIds: Array.from(completedTaskIds.value)
      })

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
   * Check if a specific task is completed
   */
  const isTaskCompleted = (taskId) => {
    return completedTaskIds.value.has(taskId)
  }

  /**
   * Filter locations to only unvisited ones
   */
  const filterUnvisitedLocations = (locations) => {
    return locations.filter((location) => {
      const taskId = location._id || location.id
      return taskId && !isTaskCompleted(taskId)
    })
  }

  /**
   * Mark a task as completed (optimistic update)
   */
  const markTaskCompleted = (taskId) => {
    if (taskId) {
      completedTaskIds.value.add(taskId)
    }
  }

  /**
   * Remove task from completed list (if response deleted)
   */
  const markTaskIncomplete = (taskId) => {
    if (taskId) {
      completedTaskIds.value.delete(taskId)
    }
  }

  return {
    completedTaskIds: computed(() => Array.from(completedTaskIds.value)),
    loading: readonly(loading),
    error: readonly(error),
    loadCompletedTasks,
    isTaskCompleted,
    filterUnvisitedLocations,
    markTaskCompleted,
    markTaskIncomplete
  }
}
