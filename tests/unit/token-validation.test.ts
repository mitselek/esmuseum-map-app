/**
 * Tests for token-validation.ts utilities
 *
 * Tests JWT decoding, expiry checks, and human-readable time formatting
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useClientLogger (auto-imported in source)
vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

// Helper: create a valid JWT with given payload
function createJWT (payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'fake-signature'
  return `${header}.${body}.${signature}`
}

describe('token-validation', () => {
  let decodeJWT: typeof import('../../app/utils/token-validation').decodeJWT
  let isTokenExpired: typeof import('../../app/utils/token-validation').isTokenExpired
  let validateToken: typeof import('../../app/utils/token-validation').validateToken
  let getTimeUntilExpiry: typeof import('../../app/utils/token-validation').getTimeUntilExpiry

  beforeEach(async () => {
    vi.resetModules()
    vi.stubGlobal('useClientLogger', () => ({
      debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()
    }))
    const mod = await import('../../app/utils/token-validation')
    decodeJWT = mod.decodeJWT
    isTokenExpired = mod.isTokenExpired
    validateToken = mod.validateToken
    getTimeUntilExpiry = mod.getTimeUntilExpiry
  })

  describe('decodeJWT', () => {
    it('should decode a valid JWT payload', () => {
      const payload = { exp: 1700000000, user: 'user123', iss: 'entu' }
      const token = createJWT(payload)
      const result = decodeJWT(token)

      expect(result).toMatchObject(payload)
    })

    it('should return null for empty string', () => {
      expect(decodeJWT('')).toBeNull()
    })

    it('should return null for non-string input', () => {
      // @ts-expect-error -- testing invalid input
      expect(decodeJWT(null)).toBeNull()
      // @ts-expect-error -- testing invalid input
      expect(decodeJWT(undefined)).toBeNull()
      // @ts-expect-error -- testing invalid input
      expect(decodeJWT(123)).toBeNull()
    })

    it('should return null for JWT with wrong number of parts', () => {
      expect(decodeJWT('only-one-part')).toBeNull()
      expect(decodeJWT('two.parts')).toBeNull()
      expect(decodeJWT('four.parts.here.extra')).toBeNull()
    })

    it('should return null for invalid base64 payload', () => {
      expect(decodeJWT('header.!!!invalid-base64!!!.signature')).toBeNull()
    })

    it('should return null for non-JSON payload', () => {
      const nonJson = btoa('not json at all')
      expect(decodeJWT(`header.${nonJson}.signature`)).toBeNull()
    })

    it('should handle base64url encoding (- and _ chars)', () => {
      // Create payload with characters that differ between base64 and base64url
      const payload = { exp: 1700000000, user: 'test+user/name' }
      const payloadJson = JSON.stringify(payload)
      // Standard base64
      const base64 = btoa(payloadJson)
      // Convert to base64url
      const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      const token = `header.${base64url}.signature`

      const result = decodeJWT(token)
      expect(result).toMatchObject(payload)
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for token expiring far in the future', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const token = createJWT({ exp: futureExp, user: 'test' })

      expect(isTokenExpired(token)).toBe(false)
    })

    it('should return true for already expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const token = createJWT({ exp: pastExp, user: 'test' })

      expect(isTokenExpired(token)).toBe(true)
    })

    it('should return true for token within buffer period (default 60s)', () => {
      const almostExpired = Math.floor(Date.now() / 1000) + 30 // 30s from now, within 60s buffer
      const token = createJWT({ exp: almostExpired, user: 'test' })

      expect(isTokenExpired(token)).toBe(true)
    })

    it('should respect custom buffer seconds', () => {
      const exp = Math.floor(Date.now() / 1000) + 30 // 30s from now
      const token = createJWT({ exp, user: 'test' })

      // With 10s buffer, 30s remaining should NOT be expired
      expect(isTokenExpired(token, 10)).toBe(false)
      // With 60s buffer, 30s remaining SHOULD be expired
      expect(isTokenExpired(token, 60)).toBe(true)
    })

    it('should return true for invalid token', () => {
      expect(isTokenExpired('not-a-jwt')).toBe(true)
    })

    it('should return true for token without exp claim', () => {
      const token = createJWT({ user: 'test' })
      expect(isTokenExpired(token)).toBe(true)
    })
  })

  describe('validateToken', () => {
    it('should return error for empty token', () => {
      const result = validateToken('')

      expect(result.isValid).toBe(false)
      expect(result.isExpired).toBe(true)
      expect(result.expiresAt).toBeNull()
      expect(result.timeUntilExpiry).toBeNull()
      expect(result.error).toBe('Token is missing')
    })

    it('should return error for invalid token format', () => {
      const result = validateToken('invalid')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid token format')
    })

    it('should return error for token without exp', () => {
      const token = createJWT({ user: 'test' })
      const result = validateToken(token)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Token missing expiry claim')
    })

    it('should return valid result for non-expired token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 7200 // 2 hours
      const token = createJWT({ exp: futureExp, user: 'test' })
      const result = validateToken(token)

      expect(result.isValid).toBe(true)
      expect(result.isExpired).toBe(false)
      expect(result.expiresAt).toBeInstanceOf(Date)
      expect(result.timeUntilExpiry).toBeGreaterThan(0)
      expect(result.error).toBeUndefined()
    })

    it('should return expired result for past token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600
      const token = createJWT({ exp: pastExp, user: 'test' })
      const result = validateToken(token)

      expect(result.isValid).toBe(false)
      expect(result.isExpired).toBe(true)
      expect(result.timeUntilExpiry).toBe(0) // Clamped to 0
    })

    it('should correctly compute expiresAt date', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600
      const token = createJWT({ exp, user: 'test' })
      const result = validateToken(token)

      expect(result.expiresAt!.getTime()).toBe(exp * 1000)
    })
  })

  describe('getTimeUntilExpiry', () => {
    it('should return "expired" for expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100
      const token = createJWT({ exp: pastExp, user: 'test' })

      expect(getTimeUntilExpiry(token)).toBe('expired')
    })

    it('should return "expired" for invalid token', () => {
      expect(getTimeUntilExpiry('bad-token')).toBe('expired')
    })

    it('should format days correctly', () => {
      const exp = Math.floor(Date.now() / 1000) + 2 * 86400 + 100 // 2+ days
      const token = createJWT({ exp, user: 'test' })

      expect(getTimeUntilExpiry(token)).toBe('2 days')
    })

    it('should format single day correctly', () => {
      const exp = Math.floor(Date.now() / 1000) + 86400 + 100 // 1+ day
      const token = createJWT({ exp, user: 'test' })

      expect(getTimeUntilExpiry(token)).toBe('1 day')
    })

    it('should format hours and minutes', () => {
      const exp = Math.floor(Date.now() / 1000) + 2 * 3600 + 30 * 60 + 5 // 2h 30m
      const token = createJWT({ exp, user: 'test' })
      const result = getTimeUntilExpiry(token)

      expect(result).toMatch(/2 hours 30 minutes/)
    })

    it('should format single hour correctly', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600 + 5 * 60 + 5 // 1h 5m
      const token = createJWT({ exp, user: 'test' })
      const result = getTimeUntilExpiry(token)

      expect(result).toMatch(/1 hour 5 minutes/)
    })

    it('should format minutes only', () => {
      const exp = Math.floor(Date.now() / 1000) + 15 * 60 + 5 // 15 minutes
      const token = createJWT({ exp, user: 'test' })
      const result = getTimeUntilExpiry(token)

      expect(result).toMatch(/15 minutes/)
    })

    it('should format single minute correctly', () => {
      const exp = Math.floor(Date.now() / 1000) + 65 // 1 minute 5 seconds
      const token = createJWT({ exp, user: 'test' })

      expect(getTimeUntilExpiry(token)).toBe('1 minute')
    })

    it('should format seconds when less than a minute', () => {
      const exp = Math.floor(Date.now() / 1000) + 30 // 30 seconds
      const token = createJWT({ exp, user: 'test' })
      const result = getTimeUntilExpiry(token)

      expect(result).toMatch(/\d+ seconds?/)
    })

    it('should format 1 second correctly', () => {
      const exp = Math.floor(Date.now() / 1000) + 2 // +2 to account for floor rounding
      const token = createJWT({ exp, user: 'test' })
      const result = getTimeUntilExpiry(token)

      // Should be a small number of seconds
      expect(result).toMatch(/\d+ seconds?/)
    })
  })
})
