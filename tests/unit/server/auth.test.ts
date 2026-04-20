/**
 * Tests for server/utils/auth.ts
 *
 * Tests extractBearerToken, extractJwtToken, authenticateUser (JWT decode path),
 * checkTaskPermission, checkResponsePermission
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { server } from '../../setup'
import { installNuxtMocks, cleanupNuxtMocks } from '../../helpers/nuxt-runtime-mock'
import { createMockH3Event, createMockAuthenticatedEvent } from '../../helpers/h3-event-mock'
import { entuServerHandlers, seedEntities, clearEntities, buildMockEntity } from '../../helpers/entu-api-mock'

import {
  extractBearerToken,
  extractJwtToken,
  authenticateUser,
  checkTaskPermission,
  checkResponsePermission
} from '../../../server/utils/auth'

// Mock createLogger
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// Helper: create a minimal JWT token with given payload
function createTestJWT (payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `${header}.${body}.mock-signature`
}

describe('server/utils/auth', () => {
  beforeEach(() => {
    installNuxtMocks()
    server.use(...entuServerHandlers)
  })

  afterEach(() => {
    cleanupNuxtMocks()
    clearEntities()
  })

  describe('extractBearerToken', () => {
    it('should extract token from valid Authorization header', () => {
      const event = createMockH3Event({
        headers: { Authorization: 'Bearer my-token-123' }
      })
      expect(extractBearerToken(event)).toBe('my-token-123')
    })

    it('should throw for missing Authorization header', () => {
      const event = createMockH3Event()
      expect(() => extractBearerToken(event)).toThrow()
    })

    it('should throw for non-Bearer Authorization header', () => {
      const event = createMockH3Event({
        headers: { Authorization: 'Basic abc123' }
      })
      expect(() => extractBearerToken(event)).toThrow()
    })

    it('should throw for empty Bearer token', () => {
      const event = createMockH3Event({
        headers: { Authorization: 'Bearer ' }
      })
      expect(() => extractBearerToken(event)).toThrow()
    })

    it('should trim whitespace from token', () => {
      const event = createMockH3Event({
        headers: { Authorization: 'Bearer  my-token  ' }
      })
      expect(extractBearerToken(event)).toBe('my-token')
    })
  })

  describe('extractJwtToken', () => {
    it('should extract token from Bearer header', () => {
      const event = createMockH3Event({
        headers: { Authorization: 'Bearer jwt-token' }
      })
      expect(extractJwtToken(event)).toBe('jwt-token')
    })

    it('should fall back to session JWT token', () => {
      const event = createMockH3Event({
        context: { sessionJwtToken: 'session-jwt-token' }
      })
      expect(extractJwtToken(event)).toBe('session-jwt-token')
    })

    it('should throw when no token found anywhere', () => {
      const event = createMockH3Event()
      expect(() => extractJwtToken(event)).toThrow()
    })

    it('should prefer Bearer header over session token', () => {
      const event = createMockH3Event({
        headers: { Authorization: 'Bearer header-token' },
        context: { sessionJwtToken: 'session-token' }
      })
      expect(extractJwtToken(event)).toBe('header-token')
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate via session cookie', async () => {
      const sessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        expires: Date.now() + 3600000 // 1 hour from now
      }
      const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')

      const event = createMockH3Event({
        cookies: { 'auth-session': sessionToken }
      })

      const user = await authenticateUser(event)
      expect(user._id).toBe('user-123')
      expect(user.email).toBe('test@example.com')
    })

    it('should skip expired session and fall back to JWT', async () => {
      const expiredSession = {
        userId: 'old-user',
        email: 'old@example.com',
        expires: Date.now() - 1000 // expired
      }
      const sessionToken = Buffer.from(JSON.stringify(expiredSession)).toString('base64')

      const jwt = createTestJWT({
        user: { email: 'jwt@example.com', name: 'JWT User' },
        accounts: { esmuuseum: 'jwt-user-id' },
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const event = createMockH3Event({
        cookies: { 'auth-session': sessionToken },
        headers: { Authorization: `Bearer ${jwt}` }
      })

      const user = await authenticateUser(event)
      expect(user._id).toBe('jwt-user-id')
      expect(user.email).toBe('jwt@example.com')
    })

    it('should authenticate via JWT token payload', async () => {
      const jwt = createTestJWT({
        user: { email: 'student@school.ee', name: 'Student' },
        accounts: { esmuuseum: 'student-id-456' },
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const event = createMockAuthenticatedEvent(jwt)
      const user = await authenticateUser(event)

      expect(user._id).toBe('student-id-456')
      expect(user.email).toBe('student@school.ee')
    })

    it('should reject expired JWT and throw when API fallback also fails', async () => {
      const jwt = createTestJWT({
        user: { email: 'expired@example.com' },
        accounts: { esmuuseum: 'expired-id' },
        exp: Math.floor(Date.now() / 1000) - 3600 // expired 1h ago
      })

      const event = createMockAuthenticatedEvent(jwt)

      // JWT parsing detects expiry → falls back to API → API call fails (no matching MSW handler for /api/esmuuseum)
      await expect(authenticateUser(event)).rejects.toThrow()
    })

    it('should reject JWT without esmuuseum account and throw when API fallback fails', async () => {
      const jwt = createTestJWT({
        user: { email: 'noaccount@example.com' },
        accounts: { other_account: 'some-id' },
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const event = createMockAuthenticatedEvent(jwt)
      // Missing esmuuseum account → falls back to API → fails
      await expect(authenticateUser(event)).rejects.toThrow()
    })

    it('should throw when no auth methods work', async () => {
      const event = createMockH3Event()
      await expect(authenticateUser(event)).rejects.toThrow()
    })
  })

  describe('checkTaskPermission', () => {
    const apiConfig = {
      token: 'test-token',
      apiUrl: 'https://api.entu.app',
      accountName: 'esmuuseum'
    }

    const user = { _id: 'user-123', email: 'test@example.com' }

    it('should return true when user is in _expander array', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne', {
          _expander: [{ reference: 'user-123' }]
        })
      ])

      const result = await checkTaskPermission(user, 'task-1', apiConfig)
      expect(result).toBe(true)
    })

    it('should return true when user is in _owner array', async () => {
      seedEntities([
        buildMockEntity('task-2', 'ulesanne', {
          _owner: [{ reference: 'user-123' }]
        })
      ])

      const result = await checkTaskPermission(user, 'task-2', apiConfig)
      expect(result).toBe(true)
    })

    it('should return true when user is in _editor array', async () => {
      seedEntities([
        buildMockEntity('task-3', 'ulesanne', {
          _editor: [{ reference: 'user-123' }]
        })
      ])

      const result = await checkTaskPermission(user, 'task-3', apiConfig)
      expect(result).toBe(true)
    })

    it('should return false when user has no permission', async () => {
      seedEntities([
        buildMockEntity('task-4', 'ulesanne', {
          _expander: [{ reference: 'other-user' }]
        })
      ])

      const result = await checkTaskPermission(user, 'task-4', apiConfig)
      expect(result).toBe(false)
    })

    it('should return false for non-existent task', async () => {
      seedEntities([]) // empty store

      const result = await checkTaskPermission(user, 'nonexistent', apiConfig)
      expect(result).toBe(false)
    })
  })

  describe('checkResponsePermission', () => {
    const apiConfig = {
      token: 'test-token',
      apiUrl: 'https://api.entu.app',
      accountName: 'esmuuseum'
    }

    const user = { _id: 'user-123', email: 'test@example.com' }

    it('should return false for non-existent response', async () => {
      seedEntities([])

      const result = await checkResponsePermission(user, 'nonexistent', apiConfig)
      expect(result).toBe(false)
    })
  })
})
