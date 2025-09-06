/**
 * Authentication middleware for protected routes
 * Redirects to login page if user is not authenticated
 */
import { isClientAuthenticated, rememberRedirect } from '~/utils/auth-check.client'

export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check in SSR since we can't access localStorage there
  if (import.meta.server) return

  // If not authenticated and not going to login page, redirect to login
  if (!isClientAuthenticated() && to.path !== '/login') {
    // Store the intended destination to redirect after login
    if (import.meta.client) rememberRedirect(to.fullPath)
    return navigateTo('/login')
  }
})
