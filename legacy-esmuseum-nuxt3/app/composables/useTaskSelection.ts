/**
 * Task Selection and Navigation Composable
 * Handles task selection state and URL synchronization
 * @file useTaskSelection.ts
 */

/**
 * Task selection composable
 * Provides task selection and navigation functionality
 */
export function useTaskSelection (tasks: Ref<unknown[]>) {
  const router = useRouter()
  const route = useRoute()

  // Selection state
  const selectedTaskId = ref<string | null>(null)

  /**
   * Computed selected task
   */
  const selectedTask = computed(() => {
    return tasks.value.find(
      (task: unknown) => (task as any)._id === selectedTaskId.value
    )
  })

  /**
   * Check if a task is selected
   */
  const isTaskSelected = computed(() => !!selectedTaskId.value)

  /**
   * Select a task and update URL
   */
  const selectTask = (taskId: string) => {
    selectedTaskId.value = taskId

    // Update URL without navigation
    router.push({
      path: '/',
      query: { task: taskId }
    })
  }

  /**
   * Clear task selection
   */
  const clearSelection = () => {
    selectedTaskId.value = null
    router.push({ path: '/' })
  }

  /**
   * Initialize from URL route
   */
  const initializeFromRoute = () => {
    const taskId = route.query.task as string
    if (
      taskId
      && tasks.value.some((task: unknown) => (task as any)._id === taskId)
    ) {
      selectedTaskId.value = taskId
    }
  }

  /**
   * Watch route changes for task selection
   */
  watch(
    () => route.query.task,
    (taskId) => {
      if (
        typeof taskId === 'string'
        && tasks.value.some((task: unknown) => (task as any)._id === taskId)
      ) {
        selectedTaskId.value = taskId
      }
      else if (!taskId) {
        selectedTaskId.value = null
      }
    }
  )

  return {
    selectedTaskId: readonly(selectedTaskId),
    selectedTask,
    isTaskSelected,
    selectTask,
    clearSelection,
    initializeFromRoute
  }
}
