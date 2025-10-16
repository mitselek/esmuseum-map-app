// Centralized client-side auth check using localStorage
// SSR-safe: this file is only bundled for client due to .client suffix

export function getStoredAuth () {
  const token = localStorage.getItem('esm_token')
  const userRaw = localStorage.getItem('esm_user')
  // Constitutional: User data from localStorage has unknown structure until parsed
  // Principle I: Type Safety First - documented exception for localStorage parsing
  let user: unknown = null
  if (userRaw) {
    try { user = JSON.parse(userRaw) }
    catch { user = null }
  }
  return { token, user }
}

export function isClientAuthenticated () {
  const { token, user } = getStoredAuth()
  return Boolean(token && user)
}

// The key used for storing redirect path - centralized to avoid inconsistencies
export const REDIRECT_KEY = 'auth_redirect'

export function rememberRedirect (path: string) {
  try {
    localStorage.setItem(REDIRECT_KEY, path)
  }
  catch { /* no-op */ }
}

export function getAndClearRedirect (): string | null {
  try {
    const path = localStorage.getItem(REDIRECT_KEY)
    if (path) localStorage.removeItem(REDIRECT_KEY)
    return path
  }
  catch {
    return null
  }
}

// Debugging helper - logs auth-related localStorage items (only in development)
export function logAuthStorage () {
  if (typeof localStorage === 'undefined' || !import.meta.dev) return

  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('auth') || key.includes('redirect') || key.includes('esm_'))) {
      allKeys.push(`${key}: ${localStorage.getItem(key)}`)
    }
  }

  if (allKeys.length > 0) {
    console.log('Auth storage:', allKeys.join(', '))
  }
}
