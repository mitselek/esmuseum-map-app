/**
 * Task Response Persistence Composable
 * Handles user response storage and retrieval
 * @file useTaskResponsePersistence.ts
 */

/**
 * Task response persistence composable
 * Provides response storage and retrieval functionality
 */
export function useTaskResponsePersistence () {
  const { token } = useEntuAuth()

  // User responses storage
  const userResponses = ref(new Map<string, unknown>())

  /**
   * Save user response to memory, localStorage, and server
   */
  const saveUserResponse = (taskId: string, response: unknown) => {
    userResponses.value.set(taskId, response)

    // Persist to localStorage
    const stored = JSON.parse(localStorage.getItem('taskResponses') || '{}')
    stored[taskId] = response
    localStorage.setItem('taskResponses', JSON.stringify(stored))
  }

  /**
   * Load user response from memory, localStorage, or server
   */
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
    catch {
      console.log('No saved response found for task:', taskId)
    }

    return null
  }

  return {
    userResponses: readonly(userResponses),
    saveUserResponse,
    loadUserResponse
  }
}
