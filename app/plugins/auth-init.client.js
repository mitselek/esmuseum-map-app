/**
 * Client-side auth initialization plugin
 * This runs once when the app starts on the client
 */

export default defineNuxtPlugin(async () => {
  // Import the auth composable
  const { refreshToken, isAuthenticated } = useEntuAuth()

  // Initialize auth state on client-side startup
  try {
    console.log('Auth initialization plugin running')

    // Check if user is authenticated and refresh token if needed
    if (isAuthenticated.value) {
      await refreshToken()
      console.log('Auth token refreshed')
    }
    else {
      console.log('No authenticated user, skipping token refresh')
    }

    console.log('Auth initialization complete')
  }
  catch (error) {
    console.error('Auth initialization error:', error)
  }
})
