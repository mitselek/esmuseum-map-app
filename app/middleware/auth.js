// Middleware for authentication using Entu OAuth
import { isTokenExpired } from '~/utils/token-validation'
import { notifySessionExpired } from '~/composables/useNotifications'

export default defineNuxtRouteMiddleware((to, from) => {
  // 🔍 EVENT TRACKING: Auth middleware start
  console.log('🔒 [EVENT] auth middleware - Started', {
    timestamp: new Date().toISOString(),
    route: to.fullPath,
    query: to.query,
    hasDebugParam: to.query.debug !== undefined,
    fromRoute: from?.fullPath || 'initial',
    navigationTrigger: from ? 'navigation' : 'initial-load'
  })

  // Skip auth check in SSR since we can't access localStorage there
  if (import.meta.server) {
    console.log('🔒 [EVENT] auth middleware - Skipped (SSR)')
    return
  }

  // Get stored auth
  const { token, user } = getStoredAuth()
  console.log('🔒 [EVENT] auth middleware - Auth check:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    hasUser: !!user,
    userId: user?._id || 'none',
    isAuthenticated: isClientAuthenticated()
  })

  // Check if user is authenticated
  if (!isClientAuthenticated()) {
    console.log('🔒 [EVENT] auth middleware - Not authenticated, redirecting to login')
    if (import.meta.client) {
      rememberRedirect(to.fullPath)
      console.log('🔒 [EVENT] auth middleware - Stored redirect path:', to.fullPath)
    }
    return navigateTo('/login')
  }

  // NEW: Check if token is expired (proactive validation)
  if (token && isTokenExpired(token)) {
    console.warn('🔒 [EVENT] auth middleware - Token expired, clearing and redirecting')

    // Clear expired token from storage
    if (import.meta.client) {
      localStorage.removeItem('esm_token')
      localStorage.removeItem('esm_user')

      // Remember where user was trying to go
      rememberRedirect(to.fullPath)
      console.log('🔒 [EVENT] auth middleware - Cleared expired auth, stored redirect:', to.fullPath)

      // Show notification
      notifySessionExpired()
    }

    return navigateTo('/login')
  }

  console.log('🔒 [EVENT] auth middleware - Authenticated, proceeding')
})
