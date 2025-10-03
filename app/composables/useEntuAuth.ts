/**
 * Entu Authentication Composable
 *
 * MIGRATED TO TYPESCRIPT: October 3, 2025 (Phase 3)
 * - Added comprehensive TypeScript interfaces
 * - Proper type safety for auth state
 * - Removes 'as any' casts from other composables
 *
 * Provides authentication services for Entu API including:
 * - Getting an authentication token
 * - Checking token validity
 * - Automatic token refresh
 * - Maintaining authentication state
 */

import type { Ref, ComputedRef } from 'vue'

/**
 * User object structure from Entu auth response
 */
export interface EntuUser {
  _id: string
  email?: string
  name?: string
  [key: string]: any  // Allow additional properties
}

/**
 * Auth response structure from Entu API
 */
export interface EntuAuthResponse {
  token: string
  user?: {
    email?: string
    name?: string
    [key: string]: any
  }
  accounts?: Array<{
    user?: {
      _id: string
      [key: string]: any
    }
    [key: string]: any
  }>
  [key: string]: any  // Allow additional properties
}

/**
 * Return type for useEntuAuth composable
 */
export interface UseEntuAuthReturn {
  token: Readonly<Ref<string | null>>
  user: Readonly<Ref<EntuUser | null>>
  authResponse: Readonly<Ref<EntuAuthResponse | null>>
  isAuthenticated: ComputedRef<boolean>
  isLoading: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  getToken: (oauthToken?: string | null) => Promise<EntuAuthResponse>
  refreshToken: (forceRefresh?: boolean) => Promise<string | null>
  logout: () => void
  checkAndRefreshToken: () => void
}

// Local storage keys
const TOKEN_KEY = 'esm_token'
const TOKEN_EXPIRY_KEY = 'esm_token_expiry'
const USER_KEY = 'esm_user'
const AUTH_RESPONSE_KEY = 'esm_auth_response'

// Shared state (module-level for singleton pattern)
const token = ref<string | null>(null)
const tokenExpiry = ref<number | null>(null)
const user = ref<EntuUser | null>(null)
const authResponse = ref<EntuAuthResponse | null>(null)
const isLoading = ref<boolean>(false)
const error = ref<string | null>(null)

// Initialize from localStorage on client side
if (import.meta.client) {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  const storedUser = localStorage.getItem(USER_KEY)
  const storedAuthResponse = localStorage.getItem(AUTH_RESPONSE_KEY)

  if (storedToken) token.value = storedToken
  if (storedExpiry) tokenExpiry.value = parseInt(storedExpiry)
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser) as EntuUser
    }
    catch (e) {
      console.error('Error parsing stored user data:', e)
      localStorage.removeItem(USER_KEY)
    }
  }
  if (storedAuthResponse) {
    try {
      authResponse.value = JSON.parse(storedAuthResponse) as EntuAuthResponse
    }
    catch (e) {
      console.error('Error parsing stored auth response data:', e)
      localStorage.removeItem(AUTH_RESPONSE_KEY)
    }
  }
}

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

export const useEntuAuth = (): UseEntuAuthReturn => {
  // Runtime configuration
  const config = useRuntimeConfig()

  // Computed properties
  const isAuthenticated = computed(() => {
    return !!token.value && !!tokenExpiry.value && (tokenExpiry.value > Date.now())
  })

  const isTokenExpired = computed(() => {
    return !!tokenExpiry.value && tokenExpiry.value <= Date.now()
  })

  // Check token expiration on initialization and refresh if needed
  function checkAndRefreshToken(): void {
    if (import.meta.client && isTokenExpired.value) {
      refreshToken().catch((err) => {
        console.error('Failed to refresh token:', err)
      })
    }
  }

  // Initialize token check (safe to call directly)
  checkAndRefreshToken()

  /**
   * Get a new auth token from Entu API
   * @param oauthToken - Optional OAuth token from the callback
   */
  const getToken = async (oauthToken: string | null = null): Promise<EntuAuthResponse> => {
    isLoading.value = true
    error.value = null

    try {
      // Build the API URL for authentication
      const apiUrl = config.public.entuUrl || 'https://entu.app'
      const accountName = config.public.entuAccount || 'esmuuseum'
      const url = `${apiUrl}/api/auth?account=${accountName}`
      const headers: Record<string, string> = {
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

      const data = await response.json() as EntuAuthResponse

      if (data.token) {
        // Save the entire auth response
        authResponse.value = data

        token.value = data.token
        // Set token expiry to 12 hours from now
        tokenExpiry.value = Date.now() + (12 * 60 * 60 * 1000)

        // Get user info if available
        if (data.user) {
          // Start with the basic user info (email, name)
          const newUser: EntuUser = { ...data.user, _id: '' }

          // Add user ID from the accounts array if available
          if (data.accounts?.[0]?.user?._id) {
            newUser._id = data.accounts[0].user._id
          }
          
          user.value = newUser
        }

        return data
      }
      else {
        throw new Error('No token received from authentication endpoint')
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Authentication failed'
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
  async function refreshToken(forceRefresh = false): Promise<string | null> {
    // Only refresh if the token is expired, about to expire, or if forced
    const thirtyMinutes = 30 * 60 * 1000
    if (forceRefresh || isTokenExpired.value || (tokenExpiry.value && tokenExpiry.value - Date.now() < thirtyMinutes)) {
      const data = await getToken()
      return data.token
    }
    return token.value
  }

  /**
   * Logout the user and clear all stored data
   */
  const logout = (): void => {
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
    token: readonly(token),
    user: readonly(user),
    authResponse: readonly(authResponse) as Readonly<Ref<EntuAuthResponse | null>>,
    isAuthenticated,
    isLoading: readonly(isLoading),
    error: readonly(error),
    getToken,
    refreshToken,
    logout,
    checkAndRefreshToken
  }
}
