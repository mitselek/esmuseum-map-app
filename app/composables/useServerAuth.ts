/**
 * Server-side Authentication Composable
 *
 * This composable is designed to work with the server-side authentication
 * It provides methods to check authentication status and get user info
 * from the server side API endpoints
 */

export const useServerAuth = () => {
  // State
  const isAuthenticated = ref(false)
  const user = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Available OAuth providers
  const providers = {
    GOOGLE: 'google',
    APPLE: 'apple',
    SMART_ID: 'smart-id',
    MOBILE_ID: 'mobile-id',
    ID_CARD: 'id-card'
  }

  /**
   * Check current authentication status
   */
  const checkAuthStatus = async () => {
    try {
      const response = await $fetch('/api/auth/status') as { authenticated: boolean; user: any }
      
      isAuthenticated.value = response.authenticated
      user.value = response.user
      
      return response
    } catch (error: any) {
      console.error('Failed to check auth status:', error)
      isAuthenticated.value = false
      user.value = null
      return { authenticated: false, user: null }
    }
  }

  /**
   * Start the server-side OAuth flow
   * @param {string} provider - The OAuth provider to use
   * @param {string} redirectUrl - URL to redirect to after successful auth
   */
  const startAuthFlow = async (provider: string, redirectUrl = '/') => {
    isLoading.value = true
    error.value = null

    try {
      // Validate provider
      if (!provider || !Object.values(providers).includes(provider)) {
        throw new Error('Invalid authentication provider')
      }

      // Call our server to start the OAuth flow
      const response = await $fetch('/api/auth/start', {
        method: 'POST',
        body: {
          provider,
          redirectUrl
        }
      }) as { success: boolean; authUrl?: string }

      if (!response.success || !response.authUrl) {
        throw new Error('Failed to start authentication flow')
      }

      console.log('Server-side OAuth flow started', {
        provider,
        authUrl: response.authUrl
      })

      // Redirect to the OAuth URL
      // The server will handle the callback and create a session
      window.location.href = response.authUrl

      return true
    }
    catch (err: any) {
      error.value = err.message || 'Failed to start authentication'
      isLoading.value = false
      console.error('Authentication flow error:', err)
      return false
    }
  }

  /**
   * Logout the user
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      isAuthenticated.value = false
      user.value = null

      console.log('Logout successful')
      
      // Redirect to home or login page
      await navigateTo('/')
      
    } catch (err: any) {
      error.value = err.message || 'Failed to logout'
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Handle authentication result from URL parameters
   * This is called when the user is redirected back from OAuth
   */
  const handleAuthResult = async () => {
    if (import.meta.client) {
      const urlParams = new URLSearchParams(window.location.search)
      const authResult = urlParams.get('auth')
      const message = urlParams.get('message')

      if (authResult === 'success') {
        console.log('Authentication successful, checking status...')
        await checkAuthStatus()
        
        // Clean up URL parameters
        const url = new URL(window.location.href)
        url.searchParams.delete('auth')
        url.searchParams.delete('message')
        window.history.replaceState({}, '', url.toString())
        
      } else if (authResult === 'error') {
        error.value = message || 'Authentication failed'
        console.error('Authentication failed:', message)
        
        // Clean up URL parameters
        const url = new URL(window.location.href)
        url.searchParams.delete('auth')
        url.searchParams.delete('message')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }

  // Initialize authentication status on first load
  if (import.meta.client) {
    // Check for auth result first
    handleAuthResult()
    
    // Then check current status
    checkAuthStatus()
  }

  // Return the public API
  return {
    // State
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Actions
    startAuthFlow,
    logout,
    checkAuthStatus,
    handleAuthResult,
    
    // Constants
    providers
  }
}