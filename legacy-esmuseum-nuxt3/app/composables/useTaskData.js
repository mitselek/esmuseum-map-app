/**
 * Composable for task data helpers and formatters
 * Handles task property extraction and formatting
 */
export const useTaskData = () => {
  const { t } = useI18n()

  /**
     * Get the task title from various data structures
     * @param {Object} task - Task object
     * @returns {string} Formatted task title
     */
  const getTaskTitle = (task) => {
    // Handle both data structures: task.name (string) or task.name[0].string (array format)
    if (typeof task?.name === 'string') {
      return task.name || t('taskDetail.noTitle', 'Untitled Task')
    }
    return task?.name?.[0]?.string || t('taskDetail.noTitle', 'Untitled Task')
  }

  /**
     * Get the task description from various data structures
     * @param {Object} task - Task object
     * @returns {string|null} Task description or null
     */
  const getTaskDescription = (task) => {
    return task?.description?.[0]?.string || task?.description || null
  }

  /**
     * Get the response count from task data
     * @param {Object} task - Task object
     * @returns {number} Number of responses
     */
  const getResponseCount = (task) => {
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

  return {
    getTaskTitle,
    getTaskDescription,
    getResponseCount
  }
}
