/**
 * Composable for task response management
 * Handles response statistics, loading existing responses, and task initialization
 */
export const useTaskResponse = () => {
  /**
     * Get response statistics for a task
     * @param {Object} task - Task object
     * @returns {Promise<Object>} Response statistics
     */
  const getTaskResponseStats = async (task) => {
    // Import the proper response stats composable
    const { getTaskResponseStats: getProperTaskResponseStats } = useTaskResponseStats()
    return await getProperTaskResponseStats(task)
  }

  /**
     * Load existing response data for a task
     * @param {string} taskId - Task identifier
     * @returns {Promise<Object|null>} Existing response or null
     */
  const loadExistingResponse = async (taskId) => {
    if (!taskId) return null

    try {
      const { token } = useEntuAuth()
      if (!token.value) return null

      const response = await $fetch(`/api/tasks/${taskId}/response`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return response.success ? response.response : null
    }
    catch (error) {
      console.warn('Failed to load existing response:', error)
      return null
    }
  }

  /**
     * Handle task selection and initialization
     * @param {Object} task - The selected task
     * @param {Object} options - Configuration options
     * @returns {Promise<Object>} Task initialization result
     */
  const initializeTask = async (task, options = {}) => {
    const {
      responseFormRef,
      getCurrentLocation,
      needsLocation,
      checkPermissions,
      loadTaskLocations: loadLocations,
      setStats,
      resetState
    } = options

    if (!task) {
      // No task selected, reset states
      if (resetState) {
        resetState()
      }
      return { success: false, reason: 'no_task' }
    }

    const taskId = task._id || task.id
    if (!taskId) {
      return { success: false, reason: 'no_task_id' }
    }

    try {
      const { token, user } = useEntuAuth()

      // Check permissions if required
      if (checkPermissions) {
        const permissionResult = await checkPermissions(taskId)
        if (!permissionResult.hasPermission) {
          return { success: false, reason: 'no_permission', error: permissionResult.error }
        }
      }

      // Load task locations if needed
      if (loadLocations) {
        await loadLocations(task)
      }

      // Load task stats if available
      if (setStats) {
        try {
          const stats = await getTaskResponseStats(task)
          setStats(stats)
        }
        catch (error) {
          console.warn('Failed to load task stats:', error)
        }
      }

      // Handle auto-geolocation
      await handleAutoGeolocation(needsLocation, getCurrentLocation, responseFormRef)

      // If we reach here, task is available
      if (token.value && user.value) {
        return { success: true, authenticated: true }
      }
      else {
        // Not authenticated
        console.log('Not authenticated')
        return { success: true, authenticated: false }
      }
    }
    catch (error) {
      console.error('Error initializing task:', error)
      return { success: false, error }
    }
  }

  /**
     * Handle auto-geolocation for tasks that need location
     * @param {Object} needsLocation - Reactive ref indicating if location is needed
     * @param {Function} getCurrentLocation - Function to get current location
     * @param {Object} responseFormRef - Reference to response form
     */
  const handleAutoGeolocation = async (needsLocation, getCurrentLocation, responseFormRef) => {
    if (needsLocation?.value && getCurrentLocation) {
      try {
        await getCurrentLocation(responseFormRef)
      }
      catch (error) {
        console.log('Auto-geolocation failed:', error)
        // Continue without location - user can set manually
      }
    }
  }

  return {
    getTaskResponseStats,
    loadExistingResponse,
    initializeTask,
    handleAutoGeolocation
  }
}
