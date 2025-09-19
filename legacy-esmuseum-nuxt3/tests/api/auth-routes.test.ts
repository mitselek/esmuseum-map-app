/**
 * Tests for API authentication behavior
 * Uses MSW to test auth flow with realistic scenarios
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '../setup'
import { mockTokens } from '../mocks/jwt-tokens'

// Test the authentication endpoints and behavior
describe('API Authentication', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('Token Validation', () => {
    it('should accept valid bearer token', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/68bab85d43e4daafab199988', {
        headers: {
          Authorization: `Bearer ${mockTokens.valid}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('entity')
      expect(data.entity).toHaveProperty('_id')
    })

    it('should reject expired token', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/68bab85d43e4daafab199988', {
        headers: {
          Authorization: `Bearer ${mockTokens.expired}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('expired')
    })

    it('should reject malformed token', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/68bab85d43e4daafab199988', {
        headers: {
          Authorization: `Bearer ${mockTokens.malformed}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Invalid token')
    })

    it('should reject missing authorization header', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/68bab85d43e4daafab199988', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Authorization header is required')
    })

    it('should reject invalid authorization format', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/68bab85d43e4daafab199988', {
        headers: {
          Authorization: `Basic ${mockTokens.valid}`, // Wrong format
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Authorization header is required')
    })
  })

  describe('User Profile Endpoint', () => {
    it('should return user profile for valid token', async () => {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          Authorization: `Bearer ${mockTokens.valid}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('entity')
      expect(data.entity).toHaveProperty('_id')
      expect(data.entity).toHaveProperty('_type')
      expect(data.entity._type).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ string: 'person' })
        ])
      )
    })

    it('should return 401 for missing token', async () => {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should return user with complete profile data', async () => {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          Authorization: `Bearer ${mockTokens.valid}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      // Should have personal information
      expect(data.entity).toHaveProperty('forename')
      expect(data.entity).toHaveProperty('surname')
      expect(data.entity).toHaveProperty('email')

      // Should have authentication data
      expect(data.entity).toHaveProperty('entu_user')

      // Should have permissions
      expect(data.entity).toHaveProperty('_owner')
      expect(data.entity).toHaveProperty('_viewer')
    })
  })

  describe('Search Endpoint Authentication', () => {
    it('should return search results for authenticated user', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/search?_type.string=ulesanne', {
        headers: {
          Authorization: `Bearer ${mockTokens.valid}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('entities')
      expect(Array.isArray(data.entities)).toBe(true)
    })

    it('should return 401 for unauthenticated search', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/search?_type.string=ulesanne', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should preserve search parameters with authentication', async () => {
      const searchParams = new URLSearchParams({
        '_type.string': 'ulesanne',
        name: 'proovikas',
        limit: '10'
      })

      const response = await fetch(`http://localhost:3000/api/tasks/search?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${mockTokens.valid}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('entities')
      expect(data).toHaveProperty('count')

      // Should respect search filters
      if (data.entities.length > 0) {
        expect(data.entities[0]).toHaveProperty('name')
        expect(data.entities[0].name).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              string: expect.stringContaining('proovikas')
            })
          ])
        )
      }
    })
  })

  describe('Authentication Error Responses', () => {
    it('should return consistent error format for auth failures', async () => {
      // Test missing token
      let response = await fetch('http://localhost:3000/api/tasks/search', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(response.status).toBe(401)
      let data = await response.json()
      expect(data).toHaveProperty('error')
      expect(typeof data.error).toBe('string')

      // Test invalid format
      response = await fetch('http://localhost:3000/api/tasks/search', {
        headers: {
          Authorization: 'Basic invalid',
          'Content-Type': 'application/json'
        }
      })
      expect(response.status).toBe(401)
      data = await response.json()
      expect(data).toHaveProperty('error')
      expect(typeof data.error).toBe('string')

      // Test expired token
      response = await fetch('http://localhost:3000/api/tasks/search', {
        headers: {
          Authorization: `Bearer ${mockTokens.expired}`,
          'Content-Type': 'application/json'
        }
      })
      expect(response.status).toBe(401)
      data = await response.json()
      expect(data).toHaveProperty('error')
      expect(typeof data.error).toBe('string')

      // Test malformed token
      response = await fetch('http://localhost:3000/api/tasks/search', {
        headers: {
          Authorization: `Bearer ${mockTokens.malformed}`,
          'Content-Type': 'application/json'
        }
      })
      expect(response.status).toBe(401)
      data = await response.json()
      expect(data).toHaveProperty('error')
      expect(typeof data.error).toBe('string')
    })

    it('should not leak sensitive information in error messages', async () => {
      const response = await fetch('http://localhost:3000/api/tasks/68bab85d43e4daafab199988', {
        headers: {
          Authorization: `Bearer ${mockTokens.malformed}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const data = await response.json()

      // Error message should not contain the actual token
      expect(data.error).not.toContain(mockTokens.malformed)
      expect(data.error).not.toContain('secret')
      expect(data.error).not.toContain('key')
    })
  })

  describe('Cross-Endpoint Authentication Consistency', () => {
    it('should use same auth mechanism across all endpoints', async () => {
      const endpoints = [
        '/api/tasks/68bab85d43e4daafab199988',
        '/api/tasks/search',
        '/api/user/profile'
      ]

      for (const endpoint of endpoints) {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: {
            Authorization: `Bearer ${mockTokens.valid}`,
            'Content-Type': 'application/json'
          }
        })

        expect(response.status, `${endpoint} should accept valid token`).toBe(200)
        const data = await response.json()
        expect(data, `${endpoint} should return data`).toBeTruthy()
      }
    })

    it('should reject invalid tokens consistently across endpoints', async () => {
      const endpoints = [
        '/api/tasks/68bab85d43e4daafab199988',
        '/api/tasks/search',
        '/api/user/profile'
      ]

      for (const endpoint of endpoints) {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: {
            'Content-Type': 'application/json'
            // No auth header
          }
        })

        expect(response.status, `${endpoint} should reject missing auth`).toBe(401)
      }
    })
  })
})
