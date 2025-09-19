/**
 * Composable for task permission checking
 * Handles authentication and authorization for task access
 */
export const useTaskPermissions = () => {
  /**
     * Check if user has permission to access a specific task
     * @param {string} taskId - Task identifier
     * @returns {Promise<Object>} Permission result with hasPermission and optional error
     */
  const checkTaskPermissions = async (taskId) => {
    const { token } = useEntuAuth()
    const { getEntity } = useEntuApi()

    if (!token.value) {
      return { hasPermission: false, error: 'Not authenticated' }
    }

    try {
      // Client-side permission check (F015 migration) - ACTIVE
      const taskResponse = await getEntity(taskId)

      if (!taskResponse) {
        return { hasPermission: false, error: 'Task not found' }
      }

      // Entu returns entities wrapped in an 'entity' property
      const task = taskResponse.entity || taskResponse

      // Additional check: if entity exists but has no data, it might not be a valid task
      if (!task || !task._id) {
        return { hasPermission: false, error: 'Invalid task data' }
      }

      // If we can fetch the task, user has permission
      return { hasPermission: true, task }
    }
    catch (error) {
      console.error('Error checking task permissions:', error)

      // Handle specific error cases
      if (error.statusCode === 404) {
        return { hasPermission: false, error: 'Task not found' }
      }
      if (error.statusCode === 403) {
        return { hasPermission: false, error: 'Access denied' }
      }

      return { hasPermission: false, error: 'Permission check failed' }
    }
  }

  return {
    checkTaskPermissions
  }
}
