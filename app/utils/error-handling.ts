/**
 * API Error Handling Utilities
 *
 * Provides centralized error handling logic to distinguish between
 * authentication errors (401/403) that require login redirect and
 * other errors (network, server) that can be retried.
 */

/**
 * API error types
 */
export type ApiErrorType = 'auth' | 'network' | 'server' | 'client' | 'unknown'

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  type: ApiErrorType
  shouldRetry: boolean
  shouldRedirectToLogin: boolean
  userMessage: string
  technicalMessage: string
  statusCode?: number
}

/**
 * Analyze an error and determine appropriate handling
 *
 * @param error - Error object or status code
 * @param context - Context where error occurred (for logging)
 * @returns Error handling guidance
 */
export const analyzeApiError = (
  error: unknown,
  context: string = 'API call'
): ErrorHandlingResult => {
  // Extract status code if available
  let statusCode: number | undefined
  let message = 'Unknown error'

  if (error instanceof Error) {
    message = error.message
    // Try to extract status code from error message (format: "API error: 401 Unauthorized")
    const statusMatch = message.match(/API error: (\d{3})/)
    if (statusMatch && statusMatch[1]) {
      statusCode = parseInt(statusMatch[1], 10)
    }
  }
  else if (typeof error === 'number') {
    statusCode = error
    message = `HTTP ${error}`
  }
  else if (typeof error === 'object' && error !== null) {
    // Try to extract from error object
    const err = error as any
    statusCode = err.statusCode || err.status
    message = err.message || err.statusText || message
  }

  // Determine error type and handling based on status code
  if (statusCode === 401 || statusCode === 403) {
    return {
      type: 'auth',
      shouldRetry: false,
      shouldRedirectToLogin: true,
      userMessage: 'Session expired. Please log in again.',
      technicalMessage: `Authentication failed in ${context}: ${message}`,
      statusCode
    }
  }

  if (!statusCode || statusCode === 0) {
    // Network error (no response, CORS, timeout, etc.)
    return {
      type: 'network',
      shouldRetry: true,
      shouldRedirectToLogin: false,
      userMessage: 'Network error. Please check your connection and try again.',
      technicalMessage: `Network error in ${context}: ${message}`,
      statusCode: undefined
    }
  }

  if (statusCode >= 500) {
    // Server error (500, 502, 503, etc.)
    return {
      type: 'server',
      shouldRetry: true,
      shouldRedirectToLogin: false,
      userMessage: 'Server error. Please try again later.',
      technicalMessage: `Server error in ${context}: ${message}`,
      statusCode
    }
  }

  if (statusCode >= 400 && statusCode < 500) {
    // Client error (400, 404, 422, etc.) - but not auth
    return {
      type: 'client',
      shouldRetry: false,
      shouldRedirectToLogin: false,
      userMessage: 'Request failed. Please check your input.',
      technicalMessage: `Client error in ${context}: ${message}`,
      statusCode
    }
  }

  // Unknown error
  return {
    type: 'unknown',
    shouldRetry: false,
    shouldRedirectToLogin: false,
    userMessage: 'An unexpected error occurred.',
    technicalMessage: `Unknown error in ${context}: ${message}`,
    statusCode
  }
}

/**
 * Check if error is an authentication error (401/403)
 */
export const isAuthError = (error: unknown): boolean => {
  const result = analyzeApiError(error)
  return result.type === 'auth'
}

/**
 * Check if error is retryable (network or server error)
 */
export const isRetryableError = (error: unknown): boolean => {
  const result = analyzeApiError(error)
  return result.shouldRetry
}

/**
 * Handle auth error by clearing storage and preparing for redirect
 *
 * @param redirectPath - Path to redirect to after login
 */
export const handleAuthError = (redirectPath?: string): void => {
  if (!import.meta.client) return

  console.warn('[Auth] Handling authentication error - clearing stored auth')

  // Clear expired tokens
  localStorage.removeItem('esm_token')
  localStorage.removeItem('esm_user')

  // Store redirect path if provided
  if (redirectPath && redirectPath !== '/login' && redirectPath !== '/auth/callback') {
    localStorage.setItem('auth_redirect', redirectPath)
  }
}
