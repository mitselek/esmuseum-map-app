/**
 * Entu OAuth Authentication Composable
 *
 * Provides authentication services for Entu API via OAuth.ee including:
 * - Redirecting to OAuth.ee for authentication with specific providers
 * - Handling the OAuth callback
 * - Processing the temporary API key
 */

import { ref } from 'vue'
import { useEntuAuth } from './useEntuAuth'

export const useEntuOAuth = () => {
  // Runtime configuration
  const config = useRuntimeConfig()
  const router = useRouter()
  const route = useRoute()

  // Get the auth composable for authentication state
  const { isAuthenticated } = useEntuAuth()

  // State
  const isLoading = ref(false)
  const error = ref(null)
  const callbackUrl = ref(null)

  // Available OAuth providers
  const providers = {
    GOOGLE: 'google',
    APPLE: 'apple',
    SMART_ID: 'smart-id',
    MOBILE_ID: 'mobile-id',
    ID_CARD: 'id-card'
  }

  /**
   * Start the OAuth.ee authentication flow
   * @param {string} provider - The OAuth provider to use (google, apple, smartid, mobileid, esteid)
   */
  const startOAuthFlow = (provider) => {
    isLoading.value = true
    error.value = null

    try {
      // Validate provider
      if (!provider || !Object.values(providers).includes(provider)) {
        throw new Error('Invalid authentication provider')
      }

      // Build the authentication URL
      const apiUrl = config.public.entuUrl || 'https://entu.app'
      const accountName = config.public.entuAccount || 'esmuuseum'

      // Store the current URL to redirect back after auth
      if (import.meta.client) {
        const currentPath = route.fullPath
        localStorage.setItem('auth_redirect', currentPath)

        // Get the current origin for the callback URL
        const origin = window.location.origin
        // Use a callback URL with a query parameter - this helps Entu know where to put the token
        callbackUrl.value = `${origin}/auth/callback?jwt=`
        localStorage.setItem('auth_callback_url', callbackUrl.value)
      }

      // Build the OAuth URL with callback
      const callback = encodeURIComponent(callbackUrl.value)
      // Use the /api/auth/{provider} endpoint as per documentation
      const authUrl = `${apiUrl}/api/auth/${provider}?account=${accountName}&next=${callback}`

      // In client context, show the URL and ask for confirmation before redirecting
      if (import.meta.client) {
        // Log OAuth URL information for debugging purposes
        console.log('=== OAUTH AUTHENTICATION URL ===')
        console.log(`Provider: ${provider}`)
        console.log(`Full Auth URL: ${authUrl}`)
        console.log(`Callback URL (decoded): ${callbackUrl.value}`)
        console.log('===============================')

        // Redirect directly to the OAuth authentication URL
        window.location.href = authUrl
      }

      return true
    }
    catch (err) {
      error.value = err.message || 'Failed to start OAuth flow'
      isLoading.value = false
      console.error('OAuth flow error:', err)
      return false
    }
  }

  /**
   * Handle the OAuth callback
   * This should be called from the callback route
   */
  const handleOAuthCallback = async () => {
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
        tempKey = searchParams.get('jwt')
        console.log('Found token in jwt query parameter')
      }
      // Fallback: try the old method of token in the path
      else if (fullPath.includes('/auth/callback')) {
        console.log('No jwt parameter found, trying path extraction')

        // Extract from path as a fallback
        const callbackBasePath = '/auth/callback'
        tempKey = fullPath.substring(fullPath.indexOf(callbackBasePath) + callbackBasePath.length)

        // If the token starts with a slash or query separator, remove it
        if (tempKey.startsWith('/') || tempKey.startsWith('?')) {
          tempKey = tempKey.substring(1)
        }

        console.log('Extracted token from URL path as fallback')
      }

      if (!tempKey || tempKey.length < 10) { // Basic validation to ensure we have something that looks like a token
        throw new Error('No valid temporary key found in OAuth callback')
      }

      console.log('Extracted temporary key from callback URL', tempKey)

      // Get the Entu Auth composable to store the token
      const { getToken } = useEntuAuth()

      // Use the temporary key to authenticate with Entu
      console.log('Using temporary key to authenticate with Entu')
      const authData = await getToken(tempKey)
      console.log('Authentication successful, received token data')

      // Redirect to the original page or home
      let redirectUrl = '/'
      if (import.meta.client) {
        redirectUrl = localStorage.getItem('auth_redirect') || '/'
        console.log('Redirecting to:', redirectUrl)
        localStorage.removeItem('auth_redirect')
      }

      router.push(redirectUrl)
      return authData
    }
    catch (err) {
      error.value = err.message || 'OAuth callback failed'
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
    providers,
    isLoading,
    error,
    isAuthenticated
  }
}
