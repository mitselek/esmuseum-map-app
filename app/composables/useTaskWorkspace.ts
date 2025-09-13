/**
 * Global task workspace state management
 * Handles all tasks, selection, and form persistence for F007 SPA
 */

// Global state outside the composable to persist across navigation
const globalTasks = ref<any[]>([])
const globalSelectedTaskId = ref<string | null>(null)
const globalUserResponses = ref(new Map<string, any>())
const globalLoading = ref(true)
const globalError = ref<string | null>(null)

export const useTaskWorkspace = () => {
  const router = useRouter()
  const route = useRoute()
  
  // Authentication
  const { user, token } = useEntuAuth()
  
  // Use global state
  const tasks = globalTasks
  const selectedTaskId = globalSelectedTaskId
  const userResponses = globalUserResponses
  const loading = globalLoading
  const error = globalError
  
  // Computed properties
  const selectedTask = computed(() => {
    return tasks.value.find((task: any) => task._id === selectedTaskId.value)
  })

  const isTaskSelected = computed(() => !!selectedTaskId.value)

  // Task loading
  const loadTasks = async () => {
    const currentUser = user.value as any
    if (!currentUser?._id) {
      console.warn('No user ID available for loading tasks')
      tasks.value = []
      loading.value = false
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

      // Get user groups using existing API pattern
      const userProfileResponse = await $fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }) as any

      const userProfile = userProfileResponse.entity
      const groupParents = userProfile._parent?.filter((parent: any) => parent.entity_type === 'grupp') || []

      if (groupParents.length === 0) {
        console.warn('No parent groups found for user')
        tasks.value = []
        return
      }

      const allTasks: any[] = []

      // Load tasks from each group
      for (const parentGroup of groupParents) {
        try {
          const groupTasks = await $fetch('/api/tasks/search', {
            headers: {
              Authorization: `Bearer ${token.value}`
            },
            query: {
              '_type.string': 'ulesanne',
              'grupp.reference': parentGroup.reference,  // Filter tasks assigned to this specific group
              'limit': 1000
            }
          })

          if (groupTasks.entities && groupTasks.entities.length > 0) {            allTasks.push(...groupTasks.entities.map((task: any) => ({
              ...task,
              groupId: parentGroup.reference,
              groupName: parentGroup.string || 'Unknown Group'
            })))
          }
        } catch (err) {
          console.error(`Failed to load tasks for group ${parentGroup.reference}:`, err)
        }
      }

      tasks.value = allTasks

    } catch (err: unknown) {
      console.error('Failed to load tasks:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load tasks'
    } finally {
      loading.value = false
    }
  }

  // Task selection
  const selectTask = (taskId: string) => {
    selectedTaskId.value = taskId
    
    // Update URL without navigation
    router.push({
      path: '/',
      query: { task: taskId }
    })
  }

  const clearSelection = () => {
    selectedTaskId.value = null
    router.push({ path: '/' })
  }

  // User response persistence
  const saveUserResponse = (taskId: string, response: any) => {
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
    } catch (err) {
      console.log('No saved response found for task:', taskId)
    }

    return null
  }

  // Initialize from URL
  const initializeFromRoute = () => {
    const taskId = route.query.task as string
    if (taskId && tasks.value.some((task: any) => task._id === taskId)) {
      selectedTaskId.value = taskId
    }
  }

  // Watch route changes
  watch(() => route.query.task, (taskId) => {
    if (typeof taskId === 'string' && tasks.value.some((task: any) => task._id === taskId)) {
      selectedTaskId.value = taskId
    } else if (!taskId) {
      selectedTaskId.value = null
    }
  })

  return {
    // State
    tasks: readonly(tasks),
    selectedTaskId: readonly(selectedTaskId),
    selectedTask,
    isTaskSelected,
    loading: readonly(loading),
    error: readonly(error),
    
    // Actions
    loadTasks,
    selectTask,
    clearSelection,
    saveUserResponse,
    loadUserResponse,
    initializeFromRoute
  }
}
