/**
 * Authentication Token Management Composable
 * Handles token validation, expiry checking, and token state
 * @file useAuthToken.js
 */

/**
 * Authentication token management composable
 * Provides core token functionality and validation
 */
export function useAuthToken () {
  // Token state
  const token = ref(null)
  const tokenExpiry = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
     * Check if token is currently valid
     */
  const isAuthenticated = computed(() => {
    if (!token.value || !tokenExpiry.value) return false
    return Date.now() < tokenExpiry.value
  })

  /**
     * Check if token is expired
     */
  const isTokenExpired = computed(() => {
    if (!tokenExpiry.value) return true
    return Date.now() >= tokenExpiry.value
  })

  /**
     * Set authentication token and expiry
     */
  const setToken = (newToken, expiryTime) => {
    token.value = newToken
    tokenExpiry.value = expiryTime
    error.value = null
  }

  /**
     * Clear authentication token
     */
  const clearToken = () => {
    token.value = null
    tokenExpiry.value = null
    error.value = null
  }

  /**
     * Check if token needs refresh (expires within 5 minutes)
     */
  const needsRefresh = computed(() => {
    if (!tokenExpiry.value) return true
    const fiveMinutes = 5 * 60 * 1000
    return (tokenExpiry.value - Date.now()) < fiveMinutes
  })

  /**
     * Get token expiry time in readable format
     */
  const getTokenExpiryTime = () => {
    if (!tokenExpiry.value) return null
    return new Date(tokenExpiry.value).toISOString()
  }

  return {
    // State
    token: readonly(token),
    tokenExpiry: readonly(tokenExpiry),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    isTokenExpired,
    needsRefresh,

    // Internal state setters (for use by auth flow)
    _setToken: setToken,
    _clearToken: clearToken,
    _setLoading: (loading) => { isLoading.value = loading },
    _setError: (err) => { error.value = err },

    // Utilities
    getTokenExpiryTime
  }
}
