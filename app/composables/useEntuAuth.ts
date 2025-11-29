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
 * 
 * Constitutional: Uses index signature for additional user properties from Entu
 * User objects may contain custom fields defined in Entu schema.
 * Principle I: Type Safety First - documented exception for external API flexibility
 */
export interface EntuUser {
  _id: string
  email?: string
  name?: string
  [key: string]: any // Allow additional properties
}

/**
 * Auth response structure from Entu API
 * 
 * Constitutional: Uses index signatures for flexible Entu auth response structure
 * Auth responses contain nested objects with dynamic properties.
 * Principle I: Type Safety First - documented exception for authentication API responses
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
  [key: string]: any // Allow additional properties
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
  refreshUserData: () => Promise<void>
  logout: () => void
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
      const parsedUser = JSON.parse(storedUser) as EntuUser
      // MIGRATION FIX: If user._id is empty/missing, try to get it from authResponse
      if (!parsedUser._id && storedAuthResponse) {
        try {
          const parsedAuthResponse = JSON.parse(storedAuthResponse) as EntuAuthResponse
          if (parsedAuthResponse.accounts?.[0]?.user?._id) {
            parsedUser._id = parsedAuthResponse.accounts[0].user._id
            console.log('🔧 [MIGRATION] Fixed user._id from authResponse:', parsedUser._id)
          }
          else if (parsedAuthResponse.user?._id) {
            parsedUser._id = parsedAuthResponse.user._id
            console.log('🔧 [MIGRATION] Fixed user._id from authResponse.user:', parsedUser._id)
          }
        }
        catch (e) {
          console.error('Error parsing stored auth response for migration:', e)
        }
      }
      // Only set user if we have a valid _id
      if (parsedUser._id) {
        user.value = parsedUser
      }
      else {
        console.warn('🔧 [MIGRATION] User object has no _id, clearing stored auth')
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
        localStorage.removeItem(AUTH_RESPONSE_KEY)
      }
    }
    catch (e) {
      console.error('Error parsing stored user data:', e)
      localStorage.removeItem(USER_KEY)
    }
  }
  if (storedAuthResponse && !authResponse.value) { // Only if not already set above
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

  // Note: Token validation is handled by components and middleware
  // No auto-check needed on initialization

  /**
   * Fetch fresh user data from Entu API
   * This ensures we have the latest user information including any name changes
   */
  const fetchFreshUserData = async (userId: string, jwtToken: string): Promise<EntuUser> => {
    const apiUrl = config.public.entuUrl || 'https://entu.app'
    const accountName = config.public.entuAccount || 'esmuuseum'

    const response = await fetch(`${apiUrl}/api/${accountName}/entity/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`)
    }

    const data = await response.json()

    // Extract user properties from Entu entity response
    return {
      _id: userId,
      email: data.entity?.email?.[0]?.string || '',
      name: data.entity?.name?.[0]?.string || '',
      forename: data.entity?.forename?.[0]?.string || '',
      surname: data.entity?.surname?.[0]?.string || '',
      picture: data.entity?.picture?.[0]?.string || ''
    }
  }

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

      // OAuth-only authentication
      if (!oauthToken) {
        throw new Error('OAuth token required for authentication')
      }
      headers.Authorization = `Bearer ${oauthToken}`

      // Make the authentication request
      const response = await fetch(url, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as EntuAuthResponse

      console.log('🔐 [DEBUG] Auth response received:', {
        hasToken: !!data.token,
        hasUser: !!data.user,
        userKeys: data.user ? Object.keys(data.user) : [],
        hasAccounts: !!data.accounts,
        accountsLength: data.accounts?.length || 0,
        firstAccountUserId: data.accounts?.[0]?.user?._id,
        userDirectId: data.user?._id
      })

      if (data.token) {
        // Save the entire auth response
        authResponse.value = data

        token.value = data.token
        // Set token expiry to 12 hours from now
        tokenExpiry.value = Date.now() + (12 * 60 * 60 * 1000)

        // Get user info if available
        if (data.user) {
          // Start with the basic user info (email, name)
          const newUser: EntuUser = {
            ...data.user,
            _id: data.user._id || '' // Try to get _id from user object first
          }

          // Add user ID from the accounts array if available (override if present)
          if (data.accounts?.[0]?.user?._id) {
            newUser._id = data.accounts[0].user._id
          }

          // Only set user if we have a valid _id
          if (newUser._id && data.token) {
            // Fetch fresh user data from Entu to ensure we have latest info (names, etc)
            try {
              const freshUserData = await fetchFreshUserData(newUser._id, data.token)
              user.value = freshUserData
            }
            catch (fetchError) {
              console.warn('Failed to fetch fresh user data, using OAuth response:', fetchError)
              user.value = newUser // Fallback to OAuth response user data
            }
          }
          else {
            console.warn('User data received but no _id found', data)
          }
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
  async function refreshToken (forceRefresh = false): Promise<string | null> {
    // OAuth tokens cannot be refreshed - user must re-authenticate
    if (!token.value || isTokenExpired.value || forceRefresh) {
      console.warn('Token expired or refresh forced - user needs to re-authenticate via OAuth')
      logout()
      return null
    }
    return token.value
  }

  /**
   * Refresh user data from Entu API using current token
   * Use this after updating user properties to get fresh data
   */
  const refreshUserData = async (): Promise<void> => {
    if (!token.value || !user.value?._id) {
      throw new Error('Cannot refresh user data: not authenticated')
    }

    try {
      const freshUserData = await fetchFreshUserData(user.value._id, token.value)
      user.value = freshUserData
    }
    catch (err) {
      console.error('Failed to refresh user data:', err)
      throw err
    }
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
    refreshUserData,
    logout
  }
}
