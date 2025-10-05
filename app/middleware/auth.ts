/**
 * Authentication Middleware
 *
 * Protects routes by checking if user is authenticated via Entu OAuth.
 * Performs proactive token expiry validation to prevent API errors.
 *
 * Flow:
 * 1. Skip check in SSR (localStorage not available)
 * 2. Check if user has valid token and user data
 * 3. Check if token is expired (with 60s buffer)
 * 4. Redirect to login if not authenticated or token expired
 * 5. Preserve destination URL for post-login redirect
 *
 * @see app/utils/token-validation.ts - Token expiry checking
 * @see app/utils/auth-check.client.ts - Auth state helpers
 */

import type { RouteLocationNormalized } from 'vue-router'
import { isTokenExpired } from '~/utils/token-validation'
import { notifySessionExpired } from '~/composables/useNotifications'
import { getStoredAuth, isClientAuthenticated, rememberRedirect } from '~/utils/auth-check.client'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
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

  // IMPORTANT: Check token expiry FIRST, before authentication check
  // This ensures expired tokens are always cleared, even if user data is missing
  if (token && isTokenExpired(token)) {
    console.warn('🔒 [EVENT] auth middleware - Token expired, clearing and redirecting')

    // Clear expired token from storage
    if (import.meta.client) {
      localStorage.removeItem('esm_token')
      localStorage.removeItem('esm_user')

      // Remember where user was trying to go
      rememberRedirect(to.fullPath)
      console.log('🔒 [EVENT] auth middleware - Cleared expired auth, stored redirect:', to.fullPath)

      // Show notification to user (Naive UI discrete API)
      notifySessionExpired()
    }

    return navigateTo('/login')
  }

  // Check if user is authenticated (both token AND user must exist)
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
