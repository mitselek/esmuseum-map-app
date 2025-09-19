/**
 * Authentication Persistence Composable
 * Handles localStorage operations for authentication data
 * @file useAuthPersistence.js
 */

/**
 * Authentication persistence composable
 * Provides localStorage functionality for auth data
 */
export function useAuthPersistence () {
  // Local storage keys
  const TOKEN_KEY = 'esm_token'
  const TOKEN_EXPIRY_KEY = 'esm_token_expiry'
  const USER_KEY = 'esm_user'
  const AUTH_RESPONSE_KEY = 'esm_auth_response'

  /**
     * Initialize data from localStorage
     */
  const initializeFromStorage = () => {
    if (!import.meta.client) return {}

    const data = {}

    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      const storedAuthResponse = localStorage.getItem(AUTH_RESPONSE_KEY)

      if (storedToken) data.token = storedToken
      if (storedExpiry) data.tokenExpiry = parseInt(storedExpiry)
      if (storedUser) data.user = JSON.parse(storedUser)
      if (storedAuthResponse) data.authResponse = JSON.parse(storedAuthResponse)
    }
    catch (e) {
      console.error('Error loading auth data from localStorage:', e)
      clearStoredAuth()
    }

    return data
  }

  /**
     * Store token in localStorage
     */
  const storeToken = (token) => {
    if (!import.meta.client) return

    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    }
    else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  /**
     * Store token expiry in localStorage
     */
  const storeTokenExpiry = (expiry) => {
    if (!import.meta.client) return

    if (expiry) {
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())
    }
    else {
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
    }
  }

  /**
     * Store user data in localStorage
     */
  const storeUser = (user) => {
    if (!import.meta.client) return

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    else {
      localStorage.removeItem(USER_KEY)
    }
  }

  /**
     * Store complete auth response in localStorage
     */
  const storeAuthResponse = (authResponse) => {
    if (!import.meta.client) return

    if (authResponse) {
      localStorage.setItem(AUTH_RESPONSE_KEY, JSON.stringify(authResponse))
    }
    else {
      localStorage.removeItem(AUTH_RESPONSE_KEY)
    }
  }

  /**
     * Clear all authentication data from localStorage
     */
  const clearStoredAuth = () => {
    if (!import.meta.client) return

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(AUTH_RESPONSE_KEY)
  }

  return {
    initializeFromStorage,
    storeToken,
    storeTokenExpiry,
    storeUser,
    storeAuthResponse,
    clearStoredAuth
  }
}
