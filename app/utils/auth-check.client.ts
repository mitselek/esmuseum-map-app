// Centralized client-side auth check using localStorage
// SSR-safe: this file is only bundled for client due to .client suffix

export function getStoredAuth() {
  const token = localStorage.getItem('esm_token')
  const userRaw = localStorage.getItem('esm_user')
  let user: any = null
  if (userRaw) {
    try { user = JSON.parse(userRaw) } catch { user = null }
  }
  return { token, user }
}

export function isClientAuthenticated() {
  const { token, user } = getStoredAuth()
  return Boolean(token && user)
}

// The key used for storing redirect path - centralized to avoid inconsistencies
export const REDIRECT_KEY = 'auth_redirect'

export function rememberRedirect(path: string) {
  try { 
    localStorage.setItem(REDIRECT_KEY, path)
    console.log('auth-check: Stored redirect path:', path) 
  } catch { /* no-op */ }
}

export function getAndClearRedirect(): string | null {
  try {
    const path = localStorage.getItem(REDIRECT_KEY)
    console.log('auth-check: Retrieved redirect path:', path)
    if (path) localStorage.removeItem(REDIRECT_KEY)
    return path
  } catch {
    return null
  }
}

// Debugging helper - logs all auth-related localStorage items
export function logAuthStorage() {
  if (typeof localStorage === 'undefined') return
  
  console.log('Current auth storage state:')
  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('auth') || key.includes('redirect') || key.includes('esm_'))) {
      console.log(`- ${key}: ${localStorage.getItem(key)}`)
    }
  }
}
