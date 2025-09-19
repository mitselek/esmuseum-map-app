/**
 * Modular Task Workspace Composable
 * Combines specialized task workspace composables
 * @file useTaskWorkspaceModular.ts
 */

import { useTaskLoading } from './useTaskLoading'
import { useTaskSelection } from './useTaskSelection'
import { useTaskResponsePersistence } from './useTaskResponsePersistence'

// Global state outside the composable to persist across navigation
const globalTasks = ref<unknown[]>([])
const globalLoading = ref(true)
const globalError = ref<string | null>(null)

/**
 * Main task workspace composable
 * Provides comprehensive task workspace functionality through modular composables
 */
export function useTaskWorkspace () {
  // Use global state
  const tasks = globalTasks
  const loading = globalLoading
  const error = globalError

  // Initialize specialized composables
  const taskLoadingComposable = useTaskLoading()
  const taskSelectionComposable = useTaskSelection(tasks)
  const responseComposable = useTaskResponsePersistence()

  /**
   * Load tasks with error handling and state management
   */
  const loadTasks = async () => {
    try {
      loading.value = true
      error.value = null

      const loadedTasks = await taskLoadingComposable.loadTasks()
      tasks.value = loadedTasks
    }
    catch (err: unknown) {
      console.error('Failed to load tasks:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load tasks'
      tasks.value = []
    }
    finally {
      loading.value = false
    }
  }

  return {
    // State
    tasks: readonly(tasks),
    loading: readonly(loading),
    error: readonly(error),

    // Task selection functionality
    ...taskSelectionComposable,

    // Response persistence functionality
    ...responseComposable,

    // Actions
    loadTasks
  }
}
