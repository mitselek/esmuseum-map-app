/**
 * Client-side auth initialization plugin
 * This runs once when the app starts on the client
 */

export default defineNuxtPlugin(async () => {
  // Import the auth composable
  const { checkAndRefreshToken } = useEntuAuth()

  // Initialize auth state on client-side startup
  try {
    console.log('Auth initialization plugin running')

    // Check token and refresh if needed
    await checkAndRefreshToken()

    console.log('Auth initialization complete')
  }
  catch (error) {
    console.error('Auth initialization error:', error)
  }
})
