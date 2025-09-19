/**
 * User State Management Composable
 * Handles user profile and authentication response data
 * @file useUserState.js
 */

/**
 * User state management composable
 * Provides user profile and auth response functionality
 */
export function useUserState () {
  // User state
  const user = ref(null)
  const authResponse = ref(null)

  /**
     * Set user data from authentication response
     */
  const setUserFromAuth = (authData) => {
    if (!authData) {
      user.value = null
      authResponse.value = null
      return
    }

    // Save the entire auth response
    authResponse.value = authData

    // Get user info if available
    if (authData.user) {
      // Start with the basic user info (email, name)
      user.value = { ...authData.user }

      // Add user ID from the accounts array if available
      if (authData.accounts && authData.accounts.length > 0 && authData.accounts[0].user && authData.accounts[0].user._id) {
        user.value._id = authData.accounts[0].user._id
      }
    }
  }

  /**
     * Clear user data
     */
  const clearUser = () => {
    user.value = null
    authResponse.value = null
  }

  /**
     * Get user ID
     */
  const getUserId = computed(() => {
    return user.value?._id || null
  })

  /**
     * Get user email
     */
  const getUserEmail = computed(() => {
    return user.value?.email || null
  })

  /**
     * Get user name
     */
  const getUserName = computed(() => {
    return user.value?.name || user.value?.displayName || null
  })

  /**
     * Check if user has specific account access
     */
  const hasAccountAccess = (accountName) => {
    if (!authResponse.value?.accounts) return false
    return authResponse.value.accounts.some((account) => account.name === accountName)
  }

  return {
    // State
    user: readonly(user),
    authResponse: readonly(authResponse),

    // Computed
    getUserId,
    getUserEmail,
    getUserName,

    // Internal setters (for use by auth flow)
    _setUserFromAuth: setUserFromAuth,
    _clearUser: clearUser,

    // Utilities
    hasAccountAccess
  }
}
