/**
 * Tests for auth-check.client.ts utilities
 *
 * Tests localStorage-based auth checking, redirect management, and debug logging
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useClientLogger (used at module level)
vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

describe('auth-check.client', () => {
  let getStoredAuth: typeof import('../../app/utils/auth-check.client').getStoredAuth
  let isClientAuthenticated: typeof import('../../app/utils/auth-check.client').isClientAuthenticated
  let rememberRedirect: typeof import('../../app/utils/auth-check.client').rememberRedirect
  let getAndClearRedirect: typeof import('../../app/utils/auth-check.client').getAndClearRedirect
  let logAuthStorage: typeof import('../../app/utils/auth-check.client').logAuthStorage
  let REDIRECT_KEY: string

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    vi.stubGlobal('useClientLogger', () => ({
      debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()
    }))

    const mod = await import('../../app/utils/auth-check.client')
    getStoredAuth = mod.getStoredAuth
    isClientAuthenticated = mod.isClientAuthenticated
    rememberRedirect = mod.rememberRedirect
    getAndClearRedirect = mod.getAndClearRedirect
    logAuthStorage = mod.logAuthStorage
    REDIRECT_KEY = mod.REDIRECT_KEY
  })

  describe('getStoredAuth', () => {
    it('should return null token and user when localStorage is empty', () => {
      const result = getStoredAuth()
      expect(result.token).toBeNull()
      expect(result.user).toBeNull()
    })

    it('should return stored token', () => {
      localStorage.setItem('esm_token', 'test-token-123')
      const result = getStoredAuth()
      expect(result.token).toBe('test-token-123')
    })

    it('should parse stored user JSON', () => {
      const user = { _id: 'user1', name: 'Test User' }
      localStorage.setItem('esm_user', JSON.stringify(user))
      const result = getStoredAuth()
      expect(result.user).toEqual(user)
    })

    it('should return null user for invalid JSON', () => {
      localStorage.setItem('esm_user', 'not-valid-json{{{')
      const result = getStoredAuth()
      expect(result.user).toBeNull()
    })

    it('should return null user when esm_user is not set', () => {
      localStorage.setItem('esm_token', 'token')
      const result = getStoredAuth()
      expect(result.user).toBeNull()
    })
  })

  describe('isClientAuthenticated', () => {
    it('should return false when neither token nor user exist', () => {
      expect(isClientAuthenticated()).toBe(false)
    })

    it('should return false when only token exists', () => {
      localStorage.setItem('esm_token', 'token')
      expect(isClientAuthenticated()).toBe(false)
    })

    it('should return false when only user exists', () => {
      localStorage.setItem('esm_user', JSON.stringify({ _id: 'u1' }))
      expect(isClientAuthenticated()).toBe(false)
    })

    it('should return true when both token and user exist', () => {
      localStorage.setItem('esm_token', 'token')
      localStorage.setItem('esm_user', JSON.stringify({ _id: 'u1' }))
      expect(isClientAuthenticated()).toBe(true)
    })
  })

  describe('REDIRECT_KEY', () => {
    it('should be auth_redirect', () => {
      expect(REDIRECT_KEY).toBe('auth_redirect')
    })
  })

  describe('rememberRedirect', () => {
    it('should store redirect path in localStorage', () => {
      rememberRedirect('/dashboard')
      expect(localStorage.getItem('auth_redirect')).toBe('/dashboard')
    })

    it('should overwrite previous redirect path', () => {
      rememberRedirect('/first')
      rememberRedirect('/second')
      expect(localStorage.getItem('auth_redirect')).toBe('/second')
    })
  })

  describe('getAndClearRedirect', () => {
    it('should return null when no redirect is stored', () => {
      expect(getAndClearRedirect()).toBeNull()
    })

    it('should return stored path and clear it', () => {
      localStorage.setItem('auth_redirect', '/dashboard')
      const result = getAndClearRedirect()

      expect(result).toBe('/dashboard')
      expect(localStorage.getItem('auth_redirect')).toBeNull()
    })

    it('should return null on second call (already cleared)', () => {
      localStorage.setItem('auth_redirect', '/dashboard')
      getAndClearRedirect()
      expect(getAndClearRedirect()).toBeNull()
    })
  })

  describe('logAuthStorage', () => {
    it('should not throw when called', () => {
      expect(() => logAuthStorage()).not.toThrow()
    })

    it('should log auth-related keys', () => {
      localStorage.setItem('esm_token', 'tok')
      localStorage.setItem('auth_redirect', '/page')
      localStorage.setItem('unrelated_key', 'value')

      // logAuthStorage checks import.meta.dev — in vitest env this is true
      // Just verify it doesn't crash with data present
      expect(() => logAuthStorage()).not.toThrow()
    })
  })
})
