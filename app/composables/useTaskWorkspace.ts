/**
 * Global task workspace state management
 * Handles all tasks, selection, and form persistence for F007 SPA
 */
import { ref, computed, watch, readonly, nextTick } from 'vue'
import type { EntuUser } from './useEntuAuth'
import type { EntuTask } from '../../types/entu'
import type { UserResponseData } from '../../types/workspace'

// Global state outside the composable to persist across navigation
const globalTasks = ref<EntuTask[]>([])
const globalSelectedTaskId = ref<string | null>(null)
const globalUserResponses = ref(new Map<string, UserResponseData>())
const globalLoading = ref(false) // 🚀 PHASE 1: Start with non-blocking state
const globalError = ref<string | null>(null)
const globalInitialized = ref(false) // Track if initial load has been attempted

export const useTaskWorkspace = () => {
  const router = useRouter()
  const route = useRoute()

  // Authentication
  const { user, token } = useEntuAuth()
  const { searchEntities } = useEntuApi()

  // Use global state
  const tasks = globalTasks
  const selectedTaskId = globalSelectedTaskId
  const userResponses = globalUserResponses
  const loading = globalLoading
  const error = globalError
  const initialized = globalInitialized

  // Computed properties
  const selectedTask = computed(() => {
    return tasks.value.find((task: EntuTask) => task._id === selectedTaskId.value)
  })

  const isTaskSelected = computed(() => !!selectedTaskId.value)

  // Task loading
  const loadTasks = async () => {
    // 🔍 EVENT TRACKING: Task loading start
    const startTime = performance.now()
    console.log('📋 [EVENT] useTaskWorkspace - loadTasks started', new Date().toISOString())

    const currentUser = user.value as EntuUser | null
    if (!currentUser?._id) {
      console.warn('No user ID available for loading tasks')
      tasks.value = []
      loading.value = false
      console.log('📋 [EVENT] useTaskWorkspace - loadTasks failed (no user)', `${(performance.now() - startTime).toFixed(2)}ms`)
      return
    }

    if (!token.value) {
      console.warn('No authentication token available')
      tasks.value = []
      loading.value = false
      return
    }

    try {
      loading.value = true
      error.value = null

      // Use Entu's permission-aware search - returns all tasks user can access
      // This works for both:
      // - Students with direct _expander permissions (from onboarding)
      // - Teachers/admins with group-based access
      // Fixes #25: Task discovery broken for direct task assignments
      const taskResponse = await searchEntities({
        '_type.string': 'ulesanne',
        limit: 1000
      })

      const allTasks: EntuTask[] = []

      if (taskResponse.entities && taskResponse.entities.length > 0) {
        // Constitutional: Safe cast - we know these are tasks because we filtered by '_type.string': 'ulesanne'
        // Principle I: Type Safety First - documented type narrowing at API boundary
        allTasks.push(...taskResponse.entities.map((task) => ({
          ...(task as EntuTask),
          // Extract group info from task's grupp property if available
          groupId: (task as EntuTask).grupp?.[0]?.reference || null,
          groupName: (task as EntuTask).grupp?.[0]?.string || null
        })))
      }

      tasks.value = allTasks

      // 🔍 EVENT TRACKING: Task loading complete
      const endTime = performance.now()
      console.log('📋 [EVENT] useTaskWorkspace - loadTasks completed', {
        timestamp: new Date().toISOString(),
        taskCount: allTasks.length,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      })
    }
    catch (err: unknown) {
      console.error('Failed to load tasks:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load tasks'
    }
    finally {
      loading.value = false
    }
  }

  // Task selection - STATE ONLY (no router.push)
  const selectTask = (taskId: string) => {
    selectedTaskId.value = taskId
    // No router.push - just update state
  }

  // Task navigation - For user-initiated navigation with URL update
  const navigateToTask = (taskId: string) => {
    // First select the task (update state)
    selectTask(taskId)

    // Then navigate (preserving existing query parameters like ?debug)
    router.push({
      path: '/',
      query: {
        ...route.query, // Preserve existing parameters like ?debug
        task: taskId // Update/add task parameter
      }
    })
  }

  const clearSelection = () => {
    selectedTaskId.value = null

    // Remove task parameter while preserving others (like ?debug)
    const { task, ...otherQuery } = route.query
    router.push({
      path: '/',
      query: otherQuery
    })
  }

  // User response persistence
  const saveUserResponse = (taskId: string, response: UserResponseData) => {
    userResponses.value.set(taskId, response)

    // Persist to localStorage
    const stored = JSON.parse(localStorage.getItem('taskResponses') || '{}')
    stored[taskId] = response
    localStorage.setItem('taskResponses', JSON.stringify(stored))
  }

  const loadUserResponse = async (taskId: string) => {
    // First check memory
    if (userResponses.value.has(taskId)) {
      return userResponses.value.get(taskId)
    }

    // Then check localStorage
    const stored = JSON.parse(localStorage.getItem('taskResponses') || '{}')
    if (stored[taskId]) {
      userResponses.value.set(taskId, stored[taskId])
      return stored[taskId]
    }

    // Finally check server
    try {
      const response = await $fetch(`/api/user-responses/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response) {
        userResponses.value.set(taskId, response)
        return response
      }
    }
    catch (err) {
      console.log('No saved response found for task:', taskId)
    }

    return null
  }

  // Initialize from URL
  const initializeFromRoute = () => {
    const taskId = route.query.task as string
    if (taskId && tasks.value.some((task: EntuTask) => task._id === taskId)) {
      selectedTaskId.value = taskId
    }
  }

  // Watch route changes - Use selectTask (state only) for route sync
  watch(() => route.query.task, (taskId) => {
    if (typeof taskId === 'string' && tasks.value.some((task: EntuTask) => task._id === taskId)) {
      // Route sync should only update state, not trigger another navigation
      console.log('🔄 [EVENT] useTaskWorkspace - Route sync selecting task', taskId)
      selectedTaskId.value = taskId
    }
    else if (!taskId) {
      selectedTaskId.value = null
    }
  })

  // 🚀 PHASE 1: Auto-initialize on first access (non-blocking)
  const autoInitialize = async () => {
    if (!initialized.value && !loading.value) {
      console.log('🚀 [EVENT] useTaskWorkspace - Auto-initializing tasks in background', new Date().toISOString())
      initialized.value = true
      await loadTasks()
    }
  }

  // Auto-initialize when tasks are first accessed
  const tasksWithInit = computed(() => {
    if (!initialized.value) {
      // Trigger background loading without blocking
      nextTick(autoInitialize)
    }
    return tasks.value
  })

  return {
    // State
    tasks: readonly(tasksWithInit), // 🚀 Auto-initializing tasks
    selectedTaskId: readonly(selectedTaskId),
    selectedTask,
    isTaskSelected,
    loading: readonly(loading),
    error: readonly(error),
    initialized: readonly(initialized),

    // Actions
    loadTasks,
    selectTask, // State-only task selection
    navigateToTask, // User-initiated navigation with URL update
    clearSelection,
    saveUserResponse,
    loadUserResponse,
    initializeFromRoute
  }
}
