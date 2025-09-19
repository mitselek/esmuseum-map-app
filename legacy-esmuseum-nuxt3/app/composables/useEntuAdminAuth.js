/**
 * Entu Admin Authentication Composable
 *
 * INTERNAL USE ONLY - Not exposed to public UI
 * Provides authentication services for backend maintenance tasks via API key
 */

export const useEntuAdminAuth = () => {
  // State
  const isLoading = ref(false)
  const error = ref(null)

  // Get the general auth composable for authentication state
  const { getToken, isAuthenticated } = useEntuAuth()

  /**
   * Authenticate with Entu API using API key
   * This method is intended for backend/admin use only and should not be exposed
   * in the public UI
   */
  const authenticateWithApiKey = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Use the API key authentication method from the general auth composable
      await getToken()
      return isAuthenticated.value
    }
    catch (err) {
      error.value = err.message || 'API key authentication failed'
      console.error('API key authentication error:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // Return the public API
  return {
    authenticateWithApiKey,
    isLoading,
    error
  }
}
