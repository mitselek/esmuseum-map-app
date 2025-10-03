/**
 * Entu OAuth Authentication Composable
 *
 * Provides authentication services for Entu API via OAuth.ee including:
 * - Redirecting to OAuth.ee for authentication with specific providers
 * - Handling the OAuth callback
 * - Processing the temporary API key
 */

import { REDIRECT_KEY } from '../utils/auth-check.client'
import type { EntuAuthResponse } from './useEntuAuth'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Available OAuth providers
 */
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple',
  SMART_ID: 'smart-id',
  MOBILE_ID: 'mobile-id',
  ID_CARD: 'id-card'
} as const

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS]

/**
 * Runtime configuration for OAuth
 */
export interface OAuthConfig {
  entuUrl?: string
  entuAccount?: string
  callbackOrigin?: string
}

/**
 * Return type of useEntuOAuth composable
 */
export interface UseEntuOAuthReturn {
  // Methods
  startOAuthFlow: (provider: OAuthProvider) => boolean
  handleOAuthCallback: () => Promise<EntuAuthResponse | null>
  
  // State
  providers: typeof OAUTH_PROVIDERS
  isLoading: Ref<boolean>
  error: Ref<string | null>
  isAuthenticated: ComputedRef<boolean>
}

// ============================================================================
// Composable
// ============================================================================

export const useEntuOAuth = (): UseEntuOAuthReturn => {
  // Runtime configuration
  const config = useRuntimeConfig()
  const router = useRouter()

  // Get the auth composable for authentication state
  const { isAuthenticated } = useEntuAuth()

  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const callbackUrl = ref<string | null>(null)

  /**
   * Start the OAuth.ee authentication flow
   * @param provider - The OAuth provider to use
   */
  const startOAuthFlow = (provider: OAuthProvider): boolean => {
    isLoading.value = true
    error.value = null

    try {
      // Validate provider
      if (!provider || !Object.values(OAUTH_PROVIDERS).includes(provider)) {
        throw new Error('Invalid authentication provider')
      }

      // Build the authentication URL
      const apiUrl = config.public.entuUrl as string || 'https://entu.app'
      const accountName = config.public.entuAccount as string || 'esmuuseum'

      // Store the current URL to redirect back after auth
      if (import.meta.client) {
        // Store the OAuth callback configuration separate from the redirect path
        // DO NOT modify auth_redirect here - it's set by the middleware

        // Use the current domain as callback origin - this is the correct approach
        // The OAuth provider should be configured to accept this domain
        let callbackOrigin = window.location.origin

        // Allow environment override if needed for special cases
        const callbackOriginOverride = config.public.callbackOrigin as string | undefined
        if (callbackOriginOverride) {
          callbackOrigin = callbackOriginOverride
        }

        // Use a callback URL with a query parameter - this helps Entu know where to put the token
        callbackUrl.value = `${callbackOrigin}/auth/callback?jwt=`
        localStorage.setItem('auth_callback_url', callbackUrl.value)
      }

      // Build the OAuth URL with callback
      const callback = encodeURIComponent(callbackUrl.value || '')
      // Use the /api/auth/{provider} endpoint as per documentation
      const authUrl = `${apiUrl}/api/auth/${provider}?account=${accountName}&next=${callback}`

      // In client context, redirect to OAuth
      if (import.meta.client) {
        console.log(`Starting OAuth flow with ${provider}`)
        window.location.href = authUrl
      }

      return true
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start OAuth flow'
      error.value = errorMessage
      isLoading.value = false
      console.error('OAuth flow error:', err)
      return false
    }
  }

  /**
   * Handle the OAuth callback
   * This should be called from the callback route
   */
  const handleOAuthCallback = async (): Promise<EntuAuthResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Extract the temporary API key from the URL
      // With our new approach, Entu should append the JWT to the jwt query parameter
      const currentUrl = window.location.href

      // Parse the URL to extract components
      const urlObj = new URL(currentUrl)
      const fullPath = urlObj.pathname
      const searchParams = urlObj.searchParams

      // Initialize the token variable
      let tempKey = ''

      // First, try to get the token from the jwt query parameter (our new approach)
      if (searchParams.has('jwt')) {
        tempKey = searchParams.get('jwt') || ''
      }
      // Fallback: try the old method of token in the path
      else if (fullPath.includes('/auth/callback')) {
        // Extract from path as a fallback
        const callbackBasePath = '/auth/callback'
        tempKey = fullPath.substring(fullPath.indexOf(callbackBasePath) + callbackBasePath.length)

        // If the token starts with a slash or query separator, remove it
        if (tempKey.startsWith('/') || tempKey.startsWith('?')) {
          tempKey = tempKey.substring(1)
        }
      }

      // Basic validation to ensure we have something that looks like a token
      if (!tempKey || tempKey.length < 10) {
        throw new Error('No valid temporary key found in OAuth callback')
      }

      // Get the Entu Auth composable to store the token
      const { getToken } = useEntuAuth()

      // Use the temporary key to authenticate with Entu
      const authData = await getToken(tempKey)

      // Redirect to the original page or home
      if (import.meta.client) {
        // Get the original path stored BEFORE starting the OAuth flow
        const originalRedirect = localStorage.getItem(REDIRECT_KEY)

        if (originalRedirect && originalRedirect !== '/login' && originalRedirect !== '/auth/callback') {
          localStorage.removeItem(REDIRECT_KEY)
          router.push(originalRedirect)
        }
        else {
          // Clean up any remaining redirect paths that aren't useful
          if (originalRedirect === '/login' || originalRedirect === '/auth/callback') {
            localStorage.removeItem(REDIRECT_KEY)
          }
          router.push('/')
        }
      }
      else {
        router.push('/')
      }

      return authData
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OAuth callback failed'
      error.value = errorMessage
      console.error('OAuth callback error:', err)
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  // Return the public API
  return {
    startOAuthFlow,
    handleOAuthCallback,
    providers: OAUTH_PROVIDERS,
    isLoading,
    error,
    isAuthenticated
  }
}
