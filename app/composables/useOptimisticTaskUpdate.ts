import type { Ref } from 'vue';

/**
 * Composable for optimistic task updates after response submission.
 * Handles immediate UI updates, rollback on error, and data refetch.
 */
export function useOptimisticTaskUpdate(task: Ref<any>) {
  /**
   * Optimistically increment the response count
   * Updates the task's vastuseid (responses) count immediately
   */
  const incrementResponseCount = () => {
    if (!task.value) return;
    
    // Increment vastuseid count
    if (typeof task.value.vastuseid === 'number') {
      task.value.vastuseid += 1;
    } else {
      // Initialize if missing
      task.value.vastuseid = 1;
    }
  };

  /**
   * Revert the optimistic response count increment
   * Called when submission fails to rollback UI changes
   */
  const revertResponseCount = () => {
    if (!task.value) return;
    
    // Decrement vastuseid count
    if (typeof task.value.vastuseid === 'number' && task.value.vastuseid > 0) {
      task.value.vastuseid -= 1;
    }
  };

  /**
   * Refetch task data from API to ensure consistency
   * Also reloads completed tasks list to update UI
   */
  const refetchTask = async (taskId: string) => {
    try {
      // Get the entu-api composable
      const { getEntity } = useEntuApi();
      const { loadCompletedTasks } = useCompletedTasks();

      // Fetch fresh task data
      const freshTask = await getEntity(taskId);
      
      // Update task ref with fresh data
      if (freshTask && task.value) {
        // Preserve the ref, just update properties
        Object.assign(task.value, freshTask);
      }

      // Reload completed tasks to update checkmarks in sidebar
      await loadCompletedTasks();
    } catch (error) {
      console.error('Failed to refetch task:', error);
      // Silent fail - user already has optimistic update
      // If it fails, they'll see stale data but submission was successful
    }
  };

  return {
    incrementResponseCount,
    revertResponseCount,
    refetchTask,
  };
}
