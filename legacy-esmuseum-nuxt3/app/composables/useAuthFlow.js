/**
 * Authentication Flow Composable
 * Handles login, logout, and token refresh operations
 * @file useAuthFlow.js
 */

/**
 * Authentication flow composable
 * Provides login, logout, and token refresh functionality
 */
export function useAuthFlow () {
  const config = useRuntimeConfig()

  // Get specialized composables
  const tokenComposable = useAuthToken()
  const persistenceComposable = useAuthPersistence()
  const userStateComposable = useUserState()

  /**
     * Check token expiration and refresh if needed
     */
  const checkAndRefreshToken = () => {
    if (import.meta.client && tokenComposable.isTokenExpired.value) {
      refreshToken().catch((err) => {
        console.error('Failed to refresh token:', err)
      })
    }
  }

  /**
     * Get a new auth token from Entu API
     */
  const getToken = async (oauthToken = null) => {
    tokenComposable._setLoading(true)
    tokenComposable._setError(null)

    try {
      // Build the API URL for authentication
      const apiUrl = config.public.entuUrl || 'https://entu.app'
      const accountName = config.public.entuAccount || 'esmuuseum'
      let url = `${apiUrl}/api/auth?account=${accountName}`
      let headers = {
        'Accept-Encoding': 'deflate'
      }

      // If we have an OAuth token, use that instead of the API key
      if (oauthToken) {
        headers.Authorization = `Bearer ${oauthToken}`
      }
      else {
        // Use the configured API key
        const apiKey = config.entuKey
        if (!apiKey) {
          throw new Error('No API key configured for authentication')
        }
        headers.Authorization = `Bearer ${apiKey}`
      }

      // Make the authentication request
      const response = await fetch(url, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.token) {
        // Set token and expiry (12 hours from now)
        const expiryTime = Date.now() + (12 * 60 * 60 * 1000)
        tokenComposable._setToken(data.token, expiryTime)

        // Set user data from auth response
        userStateComposable._setUserFromAuth(data)

        // Persist to storage
        persistenceComposable.storeToken(data.token)
        persistenceComposable.storeTokenExpiry(expiryTime)
        if (data.user) {
          persistenceComposable.storeUser(userStateComposable.user.value)
        }
        persistenceComposable.storeAuthResponse(data)

        return data
      }
      else {
        throw new Error('No token received from authentication endpoint')
      }
    }
    catch (err) {
      const errorMessage = err.message || 'Authentication failed'
      tokenComposable._setError(errorMessage)
      tokenComposable._clearToken()
      userStateComposable._clearUser()
      console.error('Entu authentication error:', err)
      throw err
    }
    finally {
      tokenComposable._setLoading(false)
    }
  }

  /**
     * Refresh the token if it's expired or about to expire
     */
  const refreshToken = async (forceRefresh = false) => {
    // Only refresh if the token is expired, about to expire, or if forced
    if (forceRefresh || tokenComposable.isTokenExpired.value || tokenComposable.needsRefresh.value) {
      return await getToken()
    }
    return tokenComposable.token.value
  }

  /**
     * Logout the user and clear all stored data
     */
  const logout = () => {
    tokenComposable._clearToken()
    userStateComposable._clearUser()
    persistenceComposable.clearStoredAuth()
  }

  return {
    getToken,
    refreshToken,
    logout,
    checkAndRefreshToken
  }
}
