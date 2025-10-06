import type { Ref } from 'vue'

/**
 * Composable for optimistic task updates after response submission.
 * Handles data refetch to ensure UI consistency after submission.
 */
export function useOptimisticTaskUpdate (task: Ref<any>) {
  /**
   * Refetch task data from API to ensure consistency
   * Also reloads completed tasks list to update actual response count
   *
   * Note: We don't do optimistic count increments because the actual count
   * is calculated from unique locations visited, which requires reloading
   * all user responses. The refetch is fast enough (~200ms) for good UX.
   */
  const refetchTask = async (taskId: string) => {
    try {
      // Get the entu-api composable
      const { getEntity } = useEntuApi()
      const { loadCompletedTasks } = useCompletedTasks()

      // Fetch fresh task data
      const freshTask = await getEntity(taskId)

      // Update task ref with fresh data
      if (freshTask && task.value) {
        // Preserve the ref, just update properties
        Object.assign(task.value, freshTask)
      }

      // Reload completed tasks to update response counts and checkmarks
      // This recalculates uniqueLocationsCount from the user's responses
      await loadCompletedTasks()
    }
    catch (error) {
      console.error('Failed to refetch task:', error)
      // Rethrow to allow error handling in the caller
      throw error
    }
  }

  return {
    refetchTask
  }
}
