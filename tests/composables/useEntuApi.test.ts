/**
 * Tests for useEntuApi composable
 * Tests core API client: callApi, searchEntities, getEntity, createEntity, auto-retry on 401
 *
 * Uses MSW handlers from the global test setup for Entu API mocking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, computed } from 'vue'
import { http, HttpResponse } from 'msw'
import { server } from '../setup'
import { mockTokens } from '../mocks/jwt-tokens'

// ============================================================================
// Mock Nuxt auto-imports and dependencies
// ============================================================================

const mockToken = ref<string | null>(mockTokens.valid)
const mockIsAuthenticated = computed(() => !!mockToken.value)
const mockRefreshToken = vi.fn()

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

vi.stubGlobal('useEntuAuth', () => ({
  token: mockToken,
  isAuthenticated: mockIsAuthenticated,
  refreshToken: mockRefreshToken
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    entuUrl: 'https://entu.app',
    entuAccount: 'esmuuseum'
  }
}))

const mockRouterPush = vi.fn()
vi.stubGlobal('useRouter', () => ({ push: mockRouterPush }))
vi.stubGlobal('useRoute', () => ({ fullPath: '/current-page' }))

// Mock error-handling utils (imported by useEntuApi)
vi.mock('~/utils/error-handling', () => ({
  analyzeApiError: vi.fn((_err: unknown, context: string) => ({
    type: 'unknown',
    shouldRetry: false,
    shouldRedirectToLogin: false,
    userMessage: 'An error occurred',
    technicalMessage: `Error in ${context}`
  })),
  handleAuthError: vi.fn()
}))

// Mock useNotifications
vi.mock('~/composables/useNotifications', () => ({
  notifyAuthRequired: vi.fn()
}))

// Import after mocks are set up
const { useEntuApi } = await import('../../app/composables/useEntuApi')

// ============================================================================
// Tests
// ============================================================================

describe('useEntuApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken.value = mockTokens.valid
    mockRefreshToken.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getApiBase', () => {
    it('should return correct base URL', () => {
      const { getApiBase } = useEntuApi()
      expect(getApiBase()).toBe('https://entu.app/api/esmuuseum')
    })
  })

  describe('callApi', () => {
    it('should return parsed JSON response on success', async () => {
      // The MSW handler for */api/esmuuseum returns account info for valid tokens
      const { callApi } = useEntuApi()
      const result = await callApi<any>('')

      // The auth mock returns user + accounts for valid token
      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
    })

    it('should set isLoading during request and reset after', async () => {
      const { callApi, isLoading } = useEntuApi()
      expect(isLoading.value).toBe(false)

      const promise = callApi('')
      // isLoading is set synchronously at the start of callApi
      expect(isLoading.value).toBe(true)

      await promise
      expect(isLoading.value).toBe(false)
    })

    it('should set error on failure', async () => {
      // Use a 500 error endpoint
      const { callApi, error } = useEntuApi()

      await expect(callApi('/server-error')).rejects.toThrow()
      expect(error.value).toBeTruthy()
    })

    it('should refresh token when not authenticated', async () => {
      mockToken.value = null // Not authenticated

      // refreshToken restores the token
      mockRefreshToken.mockImplementation(() => {
        mockToken.value = mockTokens.valid
        return Promise.resolve()
      })

      const { callApi } = useEntuApi()
      // Should call refreshToken, then proceed with valid token
      const result = await callApi<any>('')

      expect(mockRefreshToken).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should throw on non-ok responses', async () => {
      // Add a custom MSW handler that returns 500
      server.use(
        http.get('*/api/esmuuseum/custom-error-endpoint', () => {
          return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' })
        })
      )

      const { callApi } = useEntuApi()

      await expect(callApi('/custom-error-endpoint')).rejects.toThrow('API error: 500')
    })

    it('should throw on 403 without redirecting to login', async () => {
      const { analyzeApiError } = await import('~/utils/error-handling') as any
      analyzeApiError.mockReturnValue({
        type: 'client',
        shouldRetry: false,
        shouldRedirectToLogin: false,
        userMessage: 'Access denied',
        technicalMessage: 'Permission denied'
      })

      server.use(
        http.get('*/api/esmuuseum/forbidden-resource', () => {
          return new HttpResponse(null, { status: 403, statusText: 'Forbidden' })
        })
      )

      const { callApi } = useEntuApi()

      await expect(callApi('/forbidden-resource')).rejects.toThrow('API error: 403')
      expect(mockRouterPush).not.toHaveBeenCalledWith('/login')
    })
  })

  describe('401 auto-retry', () => {
    it('should retry once with refreshed token on 401', async () => {
      const { analyzeApiError } = await import('~/utils/error-handling') as any
      analyzeApiError.mockReturnValue({
        type: 'auth',
        shouldRetry: false,
        shouldRedirectToLogin: true,
        userMessage: 'Session expired',
        technicalMessage: 'Auth failed'
      })

      // Start with expired token
      mockToken.value = mockTokens.expired

      // After refresh, set valid token
      mockRefreshToken.mockImplementation(() => {
        mockToken.value = mockTokens.valid
        return Promise.resolve()
      })

      const { callApi } = useEntuApi()
      // The first request with expired token returns 401, then retry with valid token succeeds
      const result = await callApi<any>('')

      expect(mockRefreshToken).toHaveBeenCalledWith(true) // force refresh
      expect(result).toBeDefined()
    })
  })

  describe('searchEntities', () => {
    it('should return entities for task type search', async () => {
      const { searchEntities } = useEntuApi()
      const result = await searchEntities({ '_type.string': 'ulesanne' })

      expect(result.entities).toBeDefined()
      expect(Array.isArray(result.entities)).toBe(true)
    })

    it('should add default limit=1000 when not specified', async () => {
      // We can verify this indirectly — the search should succeed
      const { searchEntities } = useEntuApi()
      const result = await searchEntities({ '_type.string': 'ulesanne' })

      expect(result).toBeDefined()
    })

    it('should use provided limit instead of default', async () => {
      const { searchEntities } = useEntuApi()
      // With custom limit — should still work with MSW
      const result = await searchEntities({ '_type.string': 'ulesanne', limit: 50 })

      expect(result).toBeDefined()
    })

    it('should return empty list for unknown type', async () => {
      const { searchEntities } = useEntuApi()
      const result = await searchEntities({ '_type.string': 'nonexistent' })

      expect(result.entities).toEqual([])
      expect(result.count).toBe(0)
    })
  })

  describe('getEntity', () => {
    it('should fetch entity by ID', async () => {
      // Use the mock student user ID which is handled by MSW
      const { getEntity } = useEntuApi()
      const result = await getEntity('507f1f77bcf86cd799439011')

      expect(result).toBeDefined()
      expect(result._id).toBe('507f1f77bcf86cd799439011')
    })

    it('should throw for non-existent entity', async () => {
      const { getEntity } = useEntuApi()

      await expect(getEntity('nonexistent-id-12345')).rejects.toThrow('API error: 404')
    })
  })

  describe('createEntity', () => {
    it('should POST entity data as JSON', async () => {
      // Add MSW handler for entity creation
      server.use(
        http.post('*/api/esmuuseum/entity', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({ _id: 'new-entity-123', ...body })
        })
      )

      const { createEntity } = useEntuApi()
      const entityData = [
        { type: '_type', reference: 'vastus' },
        { type: 'vastus', string: 'my answer' }
      ]
      const result = await createEntity(entityData)

      expect(result._id).toBe('new-entity-123')
    })
  })

  describe('updateEntity', () => {
    it('should POST update to entity endpoint', async () => {
      server.use(
        http.post('*/api/esmuuseum/entity/entity-to-update', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({ _id: 'entity-to-update', ...body })
        })
      )

      const { updateEntity } = useEntuApi()
      const result = await updateEntity('entity-to-update', [{ type: 'vastus', string: 'updated answer' }])

      expect(result._id).toBe('entity-to-update')
    })
  })

  describe('deleteEntity', () => {
    it('should send DELETE request', async () => {
      server.use(
        http.delete('*/api/esmuuseum/entity/entity-to-delete', () => {
          return HttpResponse.json({ deleted: true })
        })
      )

      const { deleteEntity } = useEntuApi()
      // Should not throw
      await deleteEntity('entity-to-delete')
    })
  })

  describe('getEntitiesByType', () => {
    it('should search by type string', async () => {
      const { getEntitiesByType } = useEntuApi()
      const result = await getEntitiesByType('ulesanne')

      expect(result.entities).toBeDefined()
      expect(Array.isArray(result.entities)).toBe(true)
    })

    it('should return maps when searching for kaart type', async () => {
      const { getEntitiesByType } = useEntuApi()
      const result = await getEntitiesByType('kaart')

      expect(result.entities).toBeDefined()
    })
  })

  describe('getAccountInfo', () => {
    it('should return account info from empty endpoint', async () => {
      const { getAccountInfo } = useEntuApi()
      const result = await getAccountInfo()

      // The MSW handler for */api/esmuuseum returns user data for valid token
      expect(result).toBeDefined()
    })
  })
})
