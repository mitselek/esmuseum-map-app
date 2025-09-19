// Middleware for authentication using Entu OAuth
export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check in SSR since we can't access localStorage there
  if (import.meta.server) return

  if (!isClientAuthenticated()) {
    if (import.meta.client) {
      rememberRedirect(to.fullPath)
    }
    return navigateTo('/login')
  }
})
