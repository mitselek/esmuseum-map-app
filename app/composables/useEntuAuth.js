/**
 * Entu Authentication Composable
 *
 * Provides authentication services for Entu API including:
 * - Getting an authentication token
 * - Checking token validity
 * - Automatic token refresh
 * - Maintaining authentication state
 */

import { ref, computed, watch } from 'vue'

export const useEntuAuth = () => {
  // Runtime configuration
  const config = useRuntimeConfig()

  // State
  const token = ref(null)
  const tokenExpiry = ref(null)
  const user = ref(null)
  const authResponse = ref(null) // Store the complete auth response
  const isLoading = ref(false)
  const error = ref(null)

  // Local storage keys
  const TOKEN_KEY = 'esm_token'
  const TOKEN_EXPIRY_KEY = 'esm_token_expiry'
  const USER_KEY = 'esm_user'
  const AUTH_RESPONSE_KEY = 'esm_auth_response' // New key for complete auth response

  // Computed properties
  const isAuthenticated = computed(() => {
    return !!token.value && (tokenExpiry.value > Date.now())
  })

  const isTokenExpired = computed(() => {
    return tokenExpiry.value && tokenExpiry.value <= Date.now()
  })

  // Initialize from localStorage on client side
  onMounted(() => {
    if (import.meta.client) {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      const storedAuthResponse = localStorage.getItem(AUTH_RESPONSE_KEY)

      if (storedToken) token.value = storedToken
      if (storedExpiry) tokenExpiry.value = parseInt(storedExpiry)
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        }
        catch (e) {
          console.error('Error parsing stored user data:', e)
          localStorage.removeItem(USER_KEY)
        }
      }
      if (storedAuthResponse) {
        try {
          authResponse.value = JSON.parse(storedAuthResponse)
        }
        catch (e) {
          console.error('Error parsing stored auth response data:', e)
          localStorage.removeItem(AUTH_RESPONSE_KEY)
        }
      }

      // Check if token is expired and refresh if needed
      if (isTokenExpired.value) {
        refreshToken()
      }
    }
  })

  // Save to localStorage when token changes
  watch(token, (newToken) => {
    if (import.meta.client) {
      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken)
      }
      else {
        localStorage.removeItem(TOKEN_KEY)
      }
    }
  })

  // Save expiry to localStorage when it changes
  watch(tokenExpiry, (newExpiry) => {
    if (import.meta.client) {
      if (newExpiry) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, newExpiry.toString())
      }
      else {
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
      }
    }
  })

  // Save user to localStorage when it changes
  watch(user, (newUser) => {
    if (import.meta.client) {
      if (newUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(newUser))
      }
      else {
        localStorage.removeItem(USER_KEY)
      }
    }
  })

  // Save complete auth response to localStorage when it changes
  watch(authResponse, (newAuthResponse) => {
    if (import.meta.client) {
      if (newAuthResponse) {
        localStorage.setItem(AUTH_RESPONSE_KEY, JSON.stringify(newAuthResponse))
      }
      else {
        localStorage.removeItem(AUTH_RESPONSE_KEY)
      }
    }
  })

  /**
   * Get a new auth token from Entu API
   * @param {string} oauthToken - Optional OAuth token from the callback
   */
  const getToken = async (oauthToken = null) => {
    isLoading.value = true
    error.value = null

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
        // Use the OAuth token directly
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
        // Save the entire auth response
        authResponse.value = data

        token.value = data.token
        // Set token expiry to 12 hours from now (can be adjusted based on Entu's actual token expiry)
        tokenExpiry.value = Date.now() + (12 * 60 * 60 * 1000)

        // Get user info if available
        if (data.user) {
          user.value = data.user
        }

        return data
      }
      else {
        throw new Error('No token received from authentication endpoint')
      }
    }
    catch (err) {
      error.value = err.message || 'Authentication failed'
      token.value = null
      tokenExpiry.value = null
      user.value = null
      console.error('Entu authentication error:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh the token if it's expired or about to expire
   */
  const refreshToken = async (forceRefresh = false) => {
    // Only refresh if the token is expired, about to expire, or if forced
    if (forceRefresh || isTokenExpired.value || (tokenExpiry.value && tokenExpiry.value - Date.now() < 30 * 60 * 1000)) {
      return await getToken()
    }
    return token.value
  }

  /**
   * Logout the user and clear all stored data
   */
  const logout = () => {
    token.value = null
    tokenExpiry.value = null
    user.value = null
    authResponse.value = null

    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(AUTH_RESPONSE_KEY)
    }
  }

  // Return the composable's API
  return {
    token,
    user,
    authResponse, // Expose the complete auth response
    isAuthenticated,
    isLoading,
    error,
    getToken,
    refreshToken,
    logout
  }
}
