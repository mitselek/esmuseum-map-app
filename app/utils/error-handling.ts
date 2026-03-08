/**
 * API Error Handling Utilities
 *
 * Provides centralized error handling logic to distinguish between
 * authentication errors (401/403) that require login redirect and
 * other errors (network, server) that can be retried.
 */

import { useClientLogger } from '~/composables/useClientLogger'

const log = useClientLogger('error-handling')

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
 * Extract status code and message from various error shapes
 */
function extractErrorInfo (error: unknown): { statusCode: number | undefined, message: string } {
  if (error instanceof Error) {
    const statusMatch = error.message.match(/API error: (\d{3})/)
    return {
      statusCode: statusMatch?.[1] ? parseInt(statusMatch[1], 10) : undefined,
      message: error.message
    }
  }

  if (typeof error === 'number') {
    return { statusCode: error, message: `HTTP ${error}` }
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as { statusCode?: number, status?: number, message?: string, statusText?: string }
    return {
      statusCode: err.statusCode || err.status,
      message: err.message || err.statusText || 'Unknown error'
    }
  }

  return { statusCode: undefined, message: 'Unknown error' }
}

/** Error category definitions keyed by status code range */
type ErrorCategory = Pick<ErrorHandlingResult, 'type' | 'shouldRetry' | 'shouldRedirectToLogin' | 'userMessage'> & { prefix: string }

const STATUS_CATEGORIES: Record<number, ErrorCategory> = {
  401: { type: 'auth', shouldRetry: false, shouldRedirectToLogin: true, userMessage: 'Session expired. Please log in again.', prefix: 'Authentication failed' },
  403: { type: 'client', shouldRetry: false, shouldRedirectToLogin: false, userMessage: 'Access denied. You do not have permission to perform this action.', prefix: 'Permission denied' }
}

function categorizeByStatusCode (statusCode: number | undefined): ErrorCategory {
  if (!statusCode || statusCode === 0) {
    return { type: 'network', shouldRetry: true, shouldRedirectToLogin: false, userMessage: 'Network error. Please check your connection and try again.', prefix: 'Network error' }
  }

  const exact = STATUS_CATEGORIES[statusCode]
  if (exact) return exact

  if (statusCode >= 500) {
    return { type: 'server', shouldRetry: true, shouldRedirectToLogin: false, userMessage: 'Server error. Please try again later.', prefix: 'Server error' }
  }

  if (statusCode >= 400) {
    return { type: 'client', shouldRetry: false, shouldRedirectToLogin: false, userMessage: 'Request failed. Please check your input.', prefix: 'Client error' }
  }

  return { type: 'unknown', shouldRetry: false, shouldRedirectToLogin: false, userMessage: 'An unexpected error occurred.', prefix: 'Unknown error' }
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
  const { statusCode, message } = extractErrorInfo(error)
  const category = categorizeByStatusCode(statusCode)

  return {
    type: category.type,
    shouldRetry: category.shouldRetry,
    shouldRedirectToLogin: category.shouldRedirectToLogin,
    userMessage: category.userMessage,
    technicalMessage: `${category.prefix} in ${context}: ${message}`,
    statusCode: category.type === 'network' ? undefined : statusCode
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

  log.warn('Handling authentication error - clearing stored auth')

  // Clear expired tokens
  localStorage.removeItem('esm_token')
  localStorage.removeItem('esm_user')

  // Store redirect path if provided
  if (redirectPath && redirectPath !== '/login' && redirectPath !== '/auth/callback') {
    localStorage.setItem('auth_redirect', redirectPath)
  }
}
