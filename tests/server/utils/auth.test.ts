/**
 * Tests for server-side authentication utilities
 */
import { describe, it, expect, vi } from 'vitest'
import { extractBearerToken, authenticateUser, withAuth } from '../../../server/utils/auth'
import { mockTokens, mockUsers } from '../../mocks/jwt-tokens'

describe('Server Auth Utilities', () => {
  describe('extractBearerToken', () => {
    it('should extract valid token from Authorization header', () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.valid}`
            }
          }
        }
      }

      const token = extractBearerToken(mockEvent)
      expect(token).toBe(mockTokens.valid)
    })

    it('should throw error for missing Authorization header', () => {
      const mockEvent = {
        node: { req: { headers: {} } }
      }

      expect(() => extractBearerToken(mockEvent)).toThrow('Authorization header is required')
    })

    it('should throw error for malformed Authorization header', () => {
      const mockEvent = {
        node: {
          req: {
            headers: { authorization: 'NotBearer token' }
          }
        }
      }

      expect(() => extractBearerToken(mockEvent)).toThrow('Authorization header must be in Bearer format')
    })

    it('should throw error for empty token', () => {
      const mockEvent = {
        node: {
          req: {
            headers: { authorization: 'Bearer ' }
          }
        }
      }

      expect(() => extractBearerToken(mockEvent)).toThrow('Bearer token is required')
    })

    it('should handle case-insensitive Bearer prefix', () => {
      const mockEvent = {
        node: {
          req: {
            headers: { authorization: `bearer ${mockTokens.valid}` }
          }
        }
      }

      // Current implementation is case-sensitive, but we can test the behavior
      expect(() => extractBearerToken(mockEvent)).toThrow('Authorization header must be in Bearer format')
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user with valid JWT token', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.valid}`
            }
          }
        }
      }

      const user = await authenticateUser(mockEvent)
      
      expect(user).toMatchObject({
        _id: mockUsers.student._id,
        email: mockUsers.student.email,
        name: mockUsers.student.name
      })
    })

    it('should reject expired token', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.expired}`
            }
          }
        }
      }

      await expect(authenticateUser(mockEvent)).rejects.toThrow('Authentication failed')
    })

    it('should reject malformed token', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.malformed}`
            }
          }
        }
      }

      await expect(authenticateUser(mockEvent)).rejects.toThrow('Authentication failed')
    })

    it('should reject token with invalid signature', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.invalidSignature}`
            }
          }
        }
      }

      await expect(authenticateUser(mockEvent)).rejects.toThrow('Authentication failed')
    })

    it('should handle token without user data', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.noUser}`
            }
          }
        }
      }

      await expect(authenticateUser(mockEvent)).rejects.toThrow('Authentication failed')
    })

    it('should handle token without accounts', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.noAccounts}`
            }
          }
        }
      }

      // Should still work if user data is present, even without accounts
      const user = await authenticateUser(mockEvent)
      expect(user.email).toBe('noaccounts@student.ee')
    })

    it('should handle network errors gracefully', async () => {
      // Create a token that will trigger a server error in our mock
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: 'Bearer trigger-server-error'
            }
          }
        }
      }

      await expect(authenticateUser(mockEvent)).rejects.toThrow('Authentication failed')
    })
  })

  describe('withAuth wrapper', () => {
    it('should execute handler with authenticated user', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.valid}`
            }
          }
        }
      }

      const mockHandler = vi.fn().mockResolvedValue('success')

      const result = await withAuth(mockEvent, mockHandler)

      expect(result).toBe('success')
      expect(mockHandler).toHaveBeenCalledWith(mockEvent, expect.objectContaining({
        _id: mockUsers.student._id,
        email: mockUsers.student.email
      }))
    })

    it('should reject unauthenticated requests', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {}
          }
        }
      }

      const mockHandler = vi.fn()

      await expect(withAuth(mockEvent, mockHandler)).rejects.toThrow('Authorization header is required')
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should handle handler errors', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.valid}`
            }
          }
        }
      }

      const mockHandler = vi.fn().mockRejectedValue(new Error('Handler error'))

      await expect(withAuth(mockEvent, mockHandler)).rejects.toThrow('Handler error')
    })

    it('should pass through custom errors from handler', async () => {
      const mockEvent = {
        node: {
          req: {
            headers: {
              authorization: `Bearer ${mockTokens.valid}`
            }
          }
        }
      }

      const customError = createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })

      const mockHandler = vi.fn().mockRejectedValue(customError)

      await expect(withAuth(mockEvent, mockHandler)).rejects.toBe(customError)
    })
  })
})
