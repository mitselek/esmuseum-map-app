// Middleware for authentication using Entu OAuth
import { isClientAuthenticated, rememberRedirect } from '~/utils/auth-check.client'

export default defineNuxtRouteMiddleware((to) => {
  console.log('Auth middleware triggered for:', to.path)

  // Skip auth check in SSR since we can't access localStorage there
  if (import.meta.server) return

  if (!isClientAuthenticated()) {
    console.log('Not authenticated, redirecting to login')
    if (import.meta.client) {
      rememberRedirect(to.fullPath)
      console.log('Saved redirect path:', to.fullPath)
    }
    return navigateTo('/login')
  }

  console.log('Authenticated, allowing access')
})
