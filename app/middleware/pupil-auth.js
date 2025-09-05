// Middleware for pupil authentication using Entu OAuth
export default defineNuxtRouteMiddleware((to) => {
  console.log('Pupil auth middleware triggered for:', to.path)

  // Skip auth check in SSR since we can't access localStorage there
  if (import.meta.server) {
    console.log('Skipping auth check in SSR')
    return
  }

  // Check authentication state directly from localStorage to avoid composable lifecycle issues
  if (import.meta.client) {
    const token = localStorage.getItem('esm_token')
    const user = localStorage.getItem('esm_user')

    console.log('Auth check - token:', !!token, 'user:', !!user)

    if (!token || !user) {
      console.log('Not authenticated, redirecting to login')
      return navigateTo('/login')
    }

    console.log('Authenticated, allowing access')
  }

  // Allow access if authenticated
  return
})
