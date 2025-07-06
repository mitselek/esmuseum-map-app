/**
 * Authentication middleware for protected routes
 * Redirects to login page if user is not authenticated
 */
import { useEntuAuth } from '~/composables/useEntuAuth'

export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check in SSR since we can't access localStorage there
  if (import.meta.server) return

  const { isAuthenticated } = useEntuAuth()

  // If not authenticated and not going to login page, redirect to login
  if (!isAuthenticated.value && to.path !== '/login') {
    // Store the intended destination to redirect after login
    if (import.meta.client) {
      localStorage.setItem('auth_redirect', to.fullPath)
    }

    // Redirect to login
    return navigateTo('/login')
  }
})
