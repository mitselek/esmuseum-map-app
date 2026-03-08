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
import { decodeJWT } from '~/utils/token-validation'

/**
 * User object structure from Entu auth response
 *
 * Known fields from Entu person entities plus fields set by fetchFreshUserData.
 */
export interface EntuUser {
  _id: string
  email?: string
  name?: string
  displayname?: string
  forename?: string
  surname?: string
  picture?: string
}

/**
 * Account entry in Entu auth response
 */
export interface EntuAuthAccount {
  _id?: string
  name?: string
  user?: {
    _id: string
    email?: string
    name?: string
  }
}

/**
 * Auth response structure from Entu API
 *
 * GET /api/auth returns token + user info + account list
 */
export interface EntuAuthResponse {
  token: string
  user?: {
    _id?: string
    email?: string
    name?: string
  }
  accounts?: EntuAuthAccount[]
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
  refreshToken: (forceRefresh?: boolean) => string | null
  refreshUserData: () => Promise<void>
  logout: () => void
}

// Module-level logger for initialization code outside the composable function
const _initLog = useClientLogger('useEntuAuth')

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

/**
 * Try to fix a user's missing _id from the stored auth response
 */
const fixUserIdFromAuthResponse = (parsedUser: EntuUser, storedAuthResponse: string): void => {
  try {
    const parsedAuthResponse = JSON.parse(storedAuthResponse) as EntuAuthResponse
    const accountUserId = parsedAuthResponse.accounts?.[0]?.user?._id
    const directUserId = parsedAuthResponse.user?._id

    if (accountUserId) {
      parsedUser._id = accountUserId
      _initLog.info('🔧 [MIGRATION] Fixed user._id from authResponse:', parsedUser._id)
    }
    else if (directUserId) {
      parsedUser._id = directUserId
      _initLog.info('🔧 [MIGRATION] Fixed user._id from authResponse.user:', parsedUser._id)
    }
  }
  catch (e) {
    _initLog.error('Error parsing stored auth response for migration:', e)
  }
}

/**
 * Restore user from localStorage, applying migration fixes if needed
 */
const restoreStoredUser = (storedUser: string, storedAuthResponse: string | null): void => {
  try {
    const parsedUser = JSON.parse(storedUser) as EntuUser

    if (!parsedUser._id && storedAuthResponse) {
      fixUserIdFromAuthResponse(parsedUser, storedAuthResponse)
    }

    if (parsedUser._id) {
      user.value = parsedUser
      return
    }

    _initLog.warn('🔧 [MIGRATION] User object has no _id, clearing stored auth')
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(AUTH_RESPONSE_KEY)
  }
  catch (e) {
    _initLog.error('Error parsing stored user data:', e)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Restore auth response from localStorage
 */
const restoreStoredAuthResponse = (storedAuthResponse: string): void => {
  try {
    authResponse.value = JSON.parse(storedAuthResponse) as EntuAuthResponse
  }
  catch (e) {
    _initLog.error('Error parsing stored auth response data:', e)
    localStorage.removeItem(AUTH_RESPONSE_KEY)
  }
}

// Initialize from localStorage on client side
if (import.meta.client) {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  const storedUser = localStorage.getItem(USER_KEY)
  const storedAuthResponse = localStorage.getItem(AUTH_RESPONSE_KEY)

  if (storedToken) token.value = storedToken
  if (storedExpiry) tokenExpiry.value = parseInt(storedExpiry)
  if (storedUser) restoreStoredUser(storedUser, storedAuthResponse)
  if (storedAuthResponse && !authResponse.value) restoreStoredAuthResponse(storedAuthResponse)
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
  const log = useClientLogger('useEntuAuth')
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
   * Fetch auth response from Entu API
   */
  const fetchAuthResponse = async (oauthToken: string): Promise<EntuAuthResponse> => {
    const apiUrl = config.public.entuUrl || 'https://entu.app'
    const accountName = config.public.entuAccount || 'esmuuseum'
    const url = `${apiUrl}/api/auth?account=${accountName}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept-Encoding': 'deflate',
        Authorization: `Bearer ${oauthToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
    }

    return await response.json() as EntuAuthResponse
  }

  /**
   * Store token and expiry from auth response
   */
  const storeTokenData = (data: EntuAuthResponse): void => {
    authResponse.value = data
    token.value = data.token

    const DEFAULT_EXPIRY_MS = 48 * 60 * 60 * 1000
    const payload = decodeJWT(data.token)
    tokenExpiry.value = payload?.exp
      ? payload.exp * 1000
      : Date.now() + DEFAULT_EXPIRY_MS
  }

  /**
   * Resolve and store user data from auth response
   */
  const resolveUserData = async (data: EntuAuthResponse): Promise<void> => {
    if (!data.user) return

    const userId = data.accounts?.[0]?.user?._id || data.user._id || ''
    if (!userId) {
      log.warn('User data received but no _id found', data)
      return
    }

    try {
      user.value = await fetchFreshUserData(userId, data.token)
    }
    catch (fetchError) {
      log.warn('Failed to fetch fresh user data, using OAuth response:', fetchError)
      user.value = { ...data.user, _id: userId }
    }
  }

  /**
   * Get a new auth token from Entu API
   * @param oauthToken - Optional OAuth token from the callback
   */
  const getToken = async (oauthToken: string | null = null): Promise<EntuAuthResponse> => {
    if (!oauthToken) throw new Error('OAuth token required for authentication')

    isLoading.value = true
    error.value = null

    try {
      const data = await fetchAuthResponse(oauthToken)

      if (!data.token) {
        throw new Error('No token received from authentication endpoint')
      }

      storeTokenData(data)
      await resolveUserData(data)

      return data
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Authentication failed'
      token.value = null
      tokenExpiry.value = null
      user.value = null
      log.error('Entu authentication error:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh the token if it's expired or about to expire
   */
  function refreshToken (forceRefresh = false): string | null {
    // OAuth tokens cannot be refreshed - user must re-authenticate
    if (!token.value || isTokenExpired.value || forceRefresh) {
      log.warn('Token expired or refresh forced - user needs to re-authenticate via OAuth')
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
      log.error('Failed to refresh user data:', err)
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
