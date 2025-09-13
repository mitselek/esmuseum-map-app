/**
 * Composable for fetching task response statistics
 */
export const useTaskResponseStats = () => {
  const { token } = useEntuAuth()

  /**
   * Get the count of actual submitted responses for a task
   */
  const getActualResponseCount = async (taskId: string): Promise<number> => {
    if (!token.value || !taskId) {
      return 0
    }

    try {
      const response = await $fetch<{
        success: boolean
        taskId: string
        responseCount: number
        message: string
      }>(`/api/tasks/${taskId}/responses/count`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return response.responseCount || 0
    } catch (error) {
      console.warn(`Failed to get response count for task ${taskId}:`, error)
      return 0
    }
  }

  /**
   * Get the expected response count from task data
   */
  const getExpectedResponseCount = (task: any): number => {
    // Handle Entu array format for response count
    if (task?.vastuseid && Array.isArray(task.vastuseid) && task.vastuseid[0]?.number !== undefined) {
      return task.vastuseid[0].number
    }
    // Fallback for direct number
    if (typeof task?.responseCount === 'number') {
      return task.responseCount
    }
    return 0
  }

  /**
   * Get both actual and expected response counts for a task
   */
  const getTaskResponseStats = async (task: any) => {
    const expected = getExpectedResponseCount(task)
    const actual = await getActualResponseCount(task._id || task.id)
    
    return {
      actual,
      expected,
      progress: expected > 0 ? (actual / expected) * 100 : 0
    }
  }

  return {
    getActualResponseCount,
    getExpectedResponseCount,
    getTaskResponseStats
  }
}