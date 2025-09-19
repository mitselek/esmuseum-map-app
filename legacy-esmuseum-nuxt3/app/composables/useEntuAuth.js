/**
 * Modular Entu Authentication Composable
 * Combines specialized auth composables for comprehensive authentication
 * @file useEntuAuthModular.js
 */

/**
 * Main Entu authentication composable
 * Provides comprehensive authentication functionality through modular composables
 */
export function useEntuAuth () {
  // Initialize specialized composables
  const tokenComposable = useAuthToken()
  const persistenceComposable = useAuthPersistence()
  const userStateComposable = useUserState()
  const authFlowComposable = useAuthFlow()

  // Initialize from localStorage on client side
  if (import.meta.client) {
    const storedData = persistenceComposable.initializeFromStorage()

    if (storedData.token && storedData.tokenExpiry) {
      tokenComposable._setToken(storedData.token, storedData.tokenExpiry)
    }

    if (storedData.user || storedData.authResponse) {
      userStateComposable._setUserFromAuth(storedData.authResponse || { user: storedData.user })
    }
  }

  // Watch for changes and persist to localStorage
  watch(() => tokenComposable.token.value, (newToken) => {
    persistenceComposable.storeToken(newToken)
  })

  watch(() => tokenComposable.tokenExpiry.value, (newExpiry) => {
    persistenceComposable.storeTokenExpiry(newExpiry)
  })

  watch(() => userStateComposable.user.value, (newUser) => {
    persistenceComposable.storeUser(newUser)
  })

  watch(() => userStateComposable.authResponse.value, (newAuthResponse) => {
    persistenceComposable.storeAuthResponse(newAuthResponse)
  })

  // Initialize token check
  authFlowComposable.checkAndRefreshToken()

  return {
    // Token state
    token: tokenComposable.token,
    isAuthenticated: tokenComposable.isAuthenticated,
    isLoading: tokenComposable.isLoading,
    error: tokenComposable.error,

    // User state
    user: userStateComposable.user,
    authResponse: userStateComposable.authResponse,

    // Authentication flow methods
    getToken: authFlowComposable.getToken,
    refreshToken: authFlowComposable.refreshToken,
    logout: authFlowComposable.logout,
    checkAndRefreshToken: authFlowComposable.checkAndRefreshToken
  }
}
