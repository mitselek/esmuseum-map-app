/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Tests for /api/onboard/join-group server endpoint (FEAT-001)
 * TDD: Write tests FIRST, then implement the endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock environment
process.env.NUXT_WEBHOOK_KEY = 'test-webhook-key-123'

// Mock the Entu API utilities
vi.mock('../../server/utils/entu', () => ({
  callEntuApi: vi.fn(),
  getEntuApiConfig: vi.fn(() => ({
    token: 'mock-token',
    apiUrl: 'https://entu.app',
    accountName: 'esmuuseum'
  }))
}))

// Mock logger
vi.mock('../../server/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

describe('/api/onboard/join-group endpoint', () => {
  let callEntuApi: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Get the mocked module
    const entuModule = await import('../../server/utils/entu')
    callEntuApi = entuModule.callEntuApi
  })

  it('should return 401 if NUXT_WEBHOOK_KEY is missing', async () => {
    // Temporarily remove the webhook key
    const originalKey = process.env.NUXT_WEBHOOK_KEY
    delete process.env.NUXT_WEBHOOK_KEY

    try {
      const handler = await import('../../server/api/onboard/join-group.post')
      const mockEvent = {
        node: {
          req: {
            headers: {}
          }
        }
      } as any

      await expect(handler.default(mockEvent)).rejects.toThrow()
    }
    finally {
      process.env.NUXT_WEBHOOK_KEY = originalKey
    }
  })

  it('should return 401 if webhook key header does not match', async () => {
    const handler = await import('../../server/api/onboard/join-group.post')
    const mockEvent = {
      node: {
        req: {
          headers: {
            'x-webhook-key': 'wrong-key'
          }
        }
      }
    } as any

    await expect(handler.default(mockEvent)).rejects.toThrow()
  })

  it('should return 400 if groupId is missing from request body', async () => {
    const handler = await import('../../server/api/onboard/join-group.post')
    const mockEvent = {
      node: {
        req: {
          headers: {
            'x-webhook-key': 'test-webhook-key-123'
          }
        }
      }
    } as any

    // Mock readBody to return request without groupId
    vi.mock('h3', async () => {
      const actual = await vi.importActual('h3')
      return {
        ...actual,
        readBody: vi.fn().mockResolvedValue({
          userId: '66b6245c7efc9ac06a437b97'
        })
      }
    })

    await expect(handler.default(mockEvent)).rejects.toThrow()
  })

  it('should return 400 if userId is missing from request body', async () => {
    const handler = await import('../../server/api/onboard/join-group.post')
    const mockEvent = {
      node: {
        req: {
          headers: {
            'x-webhook-key': 'test-webhook-key-123'
          }
        }
      }
    } as any

    // Mock readBody to return request without userId
    vi.mock('h3', async () => {
      const actual = await vi.importActual('h3')
      return {
        ...actual,
        readBody: vi.fn().mockResolvedValue({
          groupId: '686a6c011749f351b9c83124'
        })
      }
    })

    await expect(handler.default(mockEvent)).rejects.toThrow()
  })

  it('should successfully assign user to group', async () => {
    // Mock successful Entu API calls
    callEntuApi.mockResolvedValueOnce({ _id: '686a6c011749f351b9c83124' }) // Entity update response

    const handler = await import('../../server/api/onboard/join-group.post')
    const mockEvent = {
      node: {
        req: {
          headers: {
            'x-webhook-key': 'test-webhook-key-123'
          }
        }
      }
    } as any

    // Mock readBody
    vi.mock('h3', async () => {
      const actual = await vi.importActual('h3')
      return {
        ...actual,
        readBody: vi.fn().mockResolvedValue({
          groupId: '686a6c011749f351b9c83124',
          userId: '66b6245c7efc9ac06a437b97'
        })
      }
    })

    const result = await handler.default(mockEvent)

    expect(result).toEqual({
      success: true,
      message: 'User successfully assigned to group'
    })

    // Verify callEntuApi was called with correct parameters
    expect(callEntuApi).toHaveBeenCalledWith(
      '/entity/66b6245c7efc9ac06a437b97',
      {
        method: 'POST',
        body: JSON.stringify([{
          type: '_parent',
          reference: '686a6c011749f351b9c83124'
        }])
      },
      expect.any(Object)
    )
  })

  it('should handle idempotent requests (user already member)', async () => {
    // Mock Entu API to check membership first
    callEntuApi
      .mockResolvedValueOnce({ // Check membership
        entities: [{ _id: '66b6245c7efc9ac06a437b97' }]
      })

    const handler = await import('../../server/api/onboard/join-group.post')
    const mockEvent = {
      node: {
        req: {
          headers: {
            'x-webhook-key': 'test-webhook-key-123'
          }
        }
      }
    } as any

    // Mock readBody
    vi.mock('h3', async () => {
      const actual = await vi.importActual('h3')
      return {
        ...actual,
        readBody: vi.fn().mockResolvedValue({
          groupId: '686a6c011749f351b9c83124',
          userId: '66b6245c7efc9ac06a437b97'
        })
      }
    })

    const result = await handler.default(mockEvent)

    expect(result).toEqual({
      success: true,
      message: 'User is already a member of this group'
    })

    // Should NOT have called POST to update entity (only checked membership)
    expect(callEntuApi).toHaveBeenCalledTimes(1)
  })

  it('should return 500 if Entu API fails', async () => {
    // Mock Entu API failure
    callEntuApi.mockRejectedValueOnce(new Error('Entu API error'))

    const handler = await import('~/server/api/onboard/join-group.post')
    const mockEvent = {
      node: {
        req: {
          headers: {
            'x-webhook-key': 'test-webhook-key-123'
          }
        }
      }
    } as any

    // Mock readBody
    vi.mock('h3', async () => {
      const actual = await vi.importActual('h3')
      return {
        ...actual,
        readBody: vi.fn().mockResolvedValue({
          groupId: '686a6c011749f351b9c83124',
          userId: '66b6245c7efc9ac06a437b97'
        })
      }
    })

    await expect(handler.default(mockEvent)).rejects.toThrow()
  })

  it('should log the request and response', async () => {
    // Mock successful operation
    callEntuApi.mockResolvedValueOnce({ _id: '686a6c011749f351b9c83124' })

    const loggerModule = await import('~/server/utils/logger')
    const logger = loggerModule.createLogger()

    const handler = await import('~/server/api/onboard/join-group.post')
    const mockEvent = {
      node: {
        req: {
          headers: {
            'x-webhook-key': 'test-webhook-key-123'
          }
        }
      }
    } as any

    // Mock readBody
    vi.mock('h3', async () => {
      const actual = await vi.importActual('h3')
      return {
        ...actual,
        readBody: vi.fn().mockResolvedValue({
          groupId: '686a6c011749f351b9c83124',
          userId: '66b6245c7efc9ac06a437b97'
        })
      }
    })

    await handler.default(mockEvent)

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Group assignment request'),
      expect.any(Object)
    )
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('User successfully assigned to group'),
      expect.any(Object)
    )
  })
})
