// Middleware for authentication using Entu OAuth
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

  // Debug auth storage
  const { token, user } = getStoredAuth()
  console.log('🔒 [EVENT] auth middleware - Auth check:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    hasUser: !!user,
    userId: user?._id || 'none',
    isAuthenticated: isClientAuthenticated()
  })

  if (!isClientAuthenticated()) {
    console.log('🔒 [EVENT] auth middleware - Not authenticated, redirecting to login')
    if (import.meta.client) {
      rememberRedirect(to.fullPath)
      console.log('🔒 [EVENT] auth middleware - Stored redirect path:', to.fullPath)
    }
    return navigateTo('/login')
  }

  console.log('🔒 [EVENT] auth middleware - Authenticated, proceeding')
})
