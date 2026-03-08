/**
 * Client-side auth initialization plugin
 * This runs once when the app starts on the client
 */

export default defineNuxtPlugin(async () => {
  // Import the auth composable
  const { refreshToken, isAuthenticated } = useEntuAuth()
  const log = useClientLogger('auth-init')

  // Initialize auth state on client-side startup
  try {
    log.info('Auth initialization plugin running')

    // Check if user is authenticated and refresh token if needed
    if (isAuthenticated.value) {
      await refreshToken()
      log.info('Auth token refreshed')
    }
    else {
      log.info('No authenticated user, skipping token refresh')
    }

    log.info('Auth initialization complete')
  }
  catch (error) {
    log.error('Auth initialization error:', error)
  }
})
