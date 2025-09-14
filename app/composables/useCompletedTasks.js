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
   * Load user's completed tasks from server
   */
  const loadCompletedTasks = async () => {
    if (!token.value) {
      completedTaskIds.value = new Set()
      return []
    }

    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/responses/user', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.success && response.data.responses) {
        // Extract task IDs from user responses
        const taskIds = response.data.responses
          .filter((resp) => resp.taskId)
          .map((resp) => resp.taskId)

        completedTaskIds.value = new Set(taskIds)
        return Array.from(completedTaskIds.value)
      }

      return []
    }
    catch (err) {
      console.error('Failed to load completed tasks:', err)
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
