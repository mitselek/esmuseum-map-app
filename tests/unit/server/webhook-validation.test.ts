/**
 * Tests for server/utils/webhook-validation.ts
 *
 * Pure extractors and validators — mock only createLogger
 */
import { describe, it, expect, vi } from 'vitest'

import {
  validateWebhookPayload,
  extractEntityId,
  extractUserToken,
  sanitizePayloadForLogging
} from '../../../server/utils/webhook-validation'

// Mock createLogger
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// Helper: create a valid Entu webhook payload
function validPayload (overrides: Record<string, unknown> = {}) {
  return {
    db: 'esmuuseum',
    entity: { _id: '507f1f77bcf86cd799439011' },
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImVtYWlsIjoiYWRtaW5AZXNtdXVzZXVtLmVlIn0sImFjY291bnRzIjp7ImVzbXV1c2V1bSI6InVzZXIxMjMifSwiZGIiOiJlc211dXNldW0ifQ.signature',
    ...overrides
  }
}

describe('webhook-validation', () => {
  describe('validateWebhookPayload', () => {
    it('should accept a valid payload', () => {
      const result = validateWebhookPayload(validPayload())
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject null payload', () => {
      const result = validateWebhookPayload(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Payload must be an object')
    })

    it('should reject non-object payload', () => {
      const result = validateWebhookPayload('string')
      expect(result.valid).toBe(false)
    })

    it('should report missing db field', () => {
      validateWebhookPayload(validPayload({ db: undefined }))
      // db is set to undefined — delete it from the object
      const payload = validPayload()
      Reflect.deleteProperty(payload, 'db')
      const result2 = validateWebhookPayload(payload)
      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('Missing db field in payload')
    })

    it('should report missing entity object', () => {
      const payload = validPayload()
      Reflect.deleteProperty(payload, 'entity')
      const result = validateWebhookPayload(payload)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing entity object in payload')
    })

    it('should report missing entity._id', () => {
      const result = validateWebhookPayload(validPayload({ entity: {} }))
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing entity._id in payload')
    })

    it('should report missing token', () => {
      const payload = validPayload()
      Reflect.deleteProperty(payload, 'token')
      const result = validateWebhookPayload(payload)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing token field in payload')
    })

    it('should report non-string token', () => {
      const result = validateWebhookPayload(validPayload({ token: 123 }))
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing token field in payload')
    })

    it('should collect multiple errors', () => {
      const result = validateWebhookPayload({})
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('extractEntityId', () => {
    it('should extract entity ID from valid payload', () => {
      expect(extractEntityId(validPayload())).toBe('507f1f77bcf86cd799439011')
    })

    it('should return null for null payload', () => {
      expect(extractEntityId(null)).toBeNull()
    })

    it('should return null for non-object payload', () => {
      expect(extractEntityId('string')).toBeNull()
    })

    it('should return null for missing entity', () => {
      expect(extractEntityId({ db: 'test' })).toBeNull()
    })

    it('should return null for entity without _id', () => {
      expect(extractEntityId({ entity: {} })).toBeNull()
    })

    it('should return null for non-string _id', () => {
      expect(extractEntityId({ entity: { _id: 123 } })).toBeNull()
    })
  })

  describe('extractUserToken', () => {
    it('should extract token and user info from valid payload', () => {
      const result = extractUserToken(validPayload())
      expect(result.token).toBeTruthy()
      expect(result.userEmail).toBe('admin@esmuuseum.ee')
      expect(result.userId).toBe('user123')
    })

    it('should return nulls for null payload', () => {
      const result = extractUserToken(null)
      expect(result.token).toBeNull()
      expect(result.userId).toBeNull()
      expect(result.userEmail).toBeNull()
    })

    it('should return nulls for missing token', () => {
      const result = extractUserToken({ db: 'test' })
      expect(result.token).toBeNull()
    })

    it('should return token but null user info for malformed JWT', () => {
      const result = extractUserToken({ token: 'not-a-jwt' })
      expect(result.token).toBe('not-a-jwt')
      expect(result.userId).toBeNull()
      expect(result.userEmail).toBeNull()
    })

    it('should handle JWT with invalid base64 payload', () => {
      const result = extractUserToken({ token: 'header.!!!invalid!!!.sig' })
      expect(result.token).toBe('header.!!!invalid!!!.sig')
      expect(result.userId).toBeNull()
    })
  })

  describe('sanitizePayloadForLogging', () => {
    it('should redact token field', () => {
      const sanitized = sanitizePayloadForLogging(validPayload()) as Record<string, unknown>
      expect(sanitized.token).toBe('***REDACTED***')
    })

    it('should redact api_key field', () => {
      const sanitized = sanitizePayloadForLogging({ api_key: 'secret123' }) as Record<string, unknown>
      expect(sanitized.api_key).toBe('***REDACTED***')
    })

    it('should redact apiKey field', () => {
      const sanitized = sanitizePayloadForLogging({ apiKey: 'secret' }) as Record<string, unknown>
      expect(sanitized.apiKey).toBe('***REDACTED***')
    })

    it('should redact secret field', () => {
      const sanitized = sanitizePayloadForLogging({ secret: 'shh' }) as Record<string, unknown>
      expect(sanitized.secret).toBe('***REDACTED***')
    })

    it('should redact password field', () => {
      const sanitized = sanitizePayloadForLogging({ password: 'pw' }) as Record<string, unknown>
      expect(sanitized.password).toBe('***REDACTED***')
    })

    it('should preserve non-sensitive fields', () => {
      const sanitized = sanitizePayloadForLogging({ db: 'test', name: 'hello' }) as Record<string, unknown>
      expect(sanitized.db).toBe('test')
      expect(sanitized.name).toBe('hello')
    })

    it('should return null for null input', () => {
      expect(sanitizePayloadForLogging(null)).toBeNull()
    })

    it('should return primitives as-is', () => {
      expect(sanitizePayloadForLogging('string')).toBe('string')
      expect(sanitizePayloadForLogging(42)).toBe(42)
    })

    it('should not mutate the original payload', () => {
      const original = { token: 'secret', db: 'test' }
      sanitizePayloadForLogging(original)
      expect(original.token).toBe('secret')
    })
  })
})
