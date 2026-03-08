/**
 * Tests for app/utils/error-handling.ts
 *
 * Pure functions: analyzeApiError, isAuthError, isRetryableError, handleAuthError
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  analyzeApiError,
  isAuthError,
  isRetryableError,
  handleAuthError
} from '../../app/utils/error-handling'

// Mock useClientLogger (client composable)
vi.mock('../../app/composables/useClientLogger', () => ({
  useClientLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

describe('error-handling', () => {
  describe('analyzeApiError', () => {
    it('should identify 401 as auth error requiring login redirect', () => {
      const result = analyzeApiError(401)
      expect(result.type).toBe('auth')
      expect(result.shouldRetry).toBe(false)
      expect(result.shouldRedirectToLogin).toBe(true)
      expect(result.statusCode).toBe(401)
    })

    it('should identify 403 as client error (not auth)', () => {
      const result = analyzeApiError(403)
      expect(result.type).toBe('client')
      expect(result.shouldRetry).toBe(false)
      expect(result.shouldRedirectToLogin).toBe(false)
      expect(result.statusCode).toBe(403)
    })

    it('should identify 500 as server error (retryable)', () => {
      const result = analyzeApiError(500)
      expect(result.type).toBe('server')
      expect(result.shouldRetry).toBe(true)
      expect(result.statusCode).toBe(500)
    })

    it('should identify 502 as server error', () => {
      const result = analyzeApiError(502)
      expect(result.type).toBe('server')
      expect(result.shouldRetry).toBe(true)
    })

    it('should identify 400 as client error (non-retryable)', () => {
      const result = analyzeApiError(400)
      expect(result.type).toBe('client')
      expect(result.shouldRetry).toBe(false)
    })

    it('should identify 404 as client error', () => {
      const result = analyzeApiError(404)
      expect(result.type).toBe('client')
      expect(result.shouldRetry).toBe(false)
    })

    it('should identify 0 as network error (retryable)', () => {
      const result = analyzeApiError(0)
      expect(result.type).toBe('network')
      expect(result.shouldRetry).toBe(true)
    })

    it('should extract status code from Error message', () => {
      const error = new Error('API error: 401 Unauthorized')
      const result = analyzeApiError(error)
      expect(result.type).toBe('auth')
      expect(result.statusCode).toBe(401)
    })

    it('should handle Error without status code as network error', () => {
      const error = new Error('Network timeout')
      const result = analyzeApiError(error)
      expect(result.type).toBe('network')
    })

    it('should handle error object with statusCode property', () => {
      const error = { statusCode: 500, message: 'Internal error' }
      const result = analyzeApiError(error)
      expect(result.type).toBe('server')
      expect(result.statusCode).toBe(500)
    })

    it('should handle error object with status property', () => {
      const error = { status: 401 }
      const result = analyzeApiError(error)
      expect(result.type).toBe('auth')
    })

    it('should include context in technical message', () => {
      const result = analyzeApiError(500, 'fetchTasks')
      expect(result.technicalMessage).toContain('fetchTasks')
    })

    it('should handle unknown error types', () => {
      // A status code that's not in any known range (e.g., 200-range)
      const result = analyzeApiError({ statusCode: 301 })
      expect(result.type).toBe('unknown')
    })

    it('should handle null error', () => {
      const result = analyzeApiError(null)
      expect(result.type).toBe('network')
    })
  })

  describe('isAuthError', () => {
    it('should return true for 401', () => {
      expect(isAuthError(401)).toBe(true)
    })

    it('should return false for 403', () => {
      expect(isAuthError(403)).toBe(false)
    })

    it('should return false for 500', () => {
      expect(isAuthError(500)).toBe(false)
    })
  })

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      expect(isRetryableError(new Error('Timeout'))).toBe(true)
    })

    it('should return true for server errors', () => {
      expect(isRetryableError(500)).toBe(true)
    })

    it('should return false for auth errors', () => {
      expect(isRetryableError(401)).toBe(false)
    })

    it('should return false for client errors', () => {
      expect(isRetryableError(400)).toBe(false)
    })
  })

  describe('handleAuthError', () => {
    beforeEach(() => {
      // import.meta.client is false in node test env, so handleAuthError returns early
      // We test it doesn't throw
      localStorage.clear()
    })

    it('should not throw', () => {
      expect(() => handleAuthError('/tasks')).not.toThrow()
    })

    it('should not throw without redirect path', () => {
      expect(() => handleAuthError()).not.toThrow()
    })
  })
})
