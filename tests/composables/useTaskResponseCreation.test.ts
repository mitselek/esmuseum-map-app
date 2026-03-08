/**
 * Tests for useTaskResponseCreation composable
 * Tests: createTaskResponse (client-side), checkExistingResponse
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed, readonly } from 'vue'

// Nuxt auto-imports readonly from Vue
vi.stubGlobal('readonly', readonly)

// ============================================================================
// Mock Nuxt auto-imports
// ============================================================================

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

const mockToken = ref<string | null>('test-token')

vi.stubGlobal('useEntuAuth', () => ({
  token: mockToken,
  isAuthenticated: computed(() => !!mockToken.value)
}))

const mockSearchEntities = vi.fn()
const mockGetEntity = vi.fn()
const mockCreateEntity = vi.fn()

vi.stubGlobal('useEntuApi', () => ({
  searchEntities: mockSearchEntities,
  getEntity: mockGetEntity,
  createEntity: mockCreateEntity
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: { entuUrl: 'https://entu.app', entuAccount: 'esmuuseum' }
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.mock('~~/utils/entu-query-builders', () => ({
  buildResponsesByTaskQuery: vi.fn((taskId: string, userId?: string) => ({
    '_type.string': 'vastus',
    'ulesanne.reference': taskId,
    ...(userId && { '_owner.reference': userId })
  }))
}))

const { useTaskResponseCreation } = await import('../../app/composables/useTaskResponseCreation')

// ============================================================================
// Tests
// ============================================================================

describe('useTaskResponseCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken.value = 'test-token'
  })

  describe('useClientSideCreation', () => {
    it('should default to client-side creation', () => {
      const { useClientSideCreation } = useTaskResponseCreation()
      expect(useClientSideCreation.value).toBe(true)
    })
  })

  describe('checkExistingResponse', () => {
    it('should return true when response exists', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [{ _id: 'response1' }]
      })

      const { checkExistingResponse } = useTaskResponseCreation()
      const result = await checkExistingResponse('task1', 'user1')

      expect(result).toBe(true)
    })

    it('should return false when no response exists', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: []
      })

      const { checkExistingResponse } = useTaskResponseCreation()
      const result = await checkExistingResponse('task1', 'user1')

      expect(result).toBe(false)
    })

    it('should return false for empty inputs', async () => {
      const { checkExistingResponse } = useTaskResponseCreation()

      expect(await checkExistingResponse('', 'user1')).toBe(false)
      expect(await checkExistingResponse('task1', '')).toBe(false)
      expect(mockSearchEntities).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      mockSearchEntities.mockRejectedValueOnce(new Error('Network error'))

      const { checkExistingResponse } = useTaskResponseCreation()
      const result = await checkExistingResponse('task1', 'user1')

      expect(result).toBe(false)
    })
  })

  describe('createTaskResponse (client-side)', () => {
    it('should create a response entity with correct properties', async () => {
      // Mock getGroupLeaderFromTask chain
      mockGetEntity
        .mockResolvedValueOnce({ entity: { _id: 'task1', grupp: [{ reference: 'group1' }] } })
        .mockResolvedValueOnce({ entity: { _id: 'group1', grupijuht: [{ reference: 'teacher1' }] } })

      mockCreateEntity.mockResolvedValueOnce({ _id: 'new-response-123' })

      const { createTaskResponse } = useTaskResponseCreation()
      const result = await createTaskResponse({
        taskId: 'task1',
        responses: [{ value: 'My answer' }],
        respondentName: 'Test Student'
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('new-response-123')
      expect(mockCreateEntity).toHaveBeenCalled()

      // Verify the properties passed to createEntity
      const entityData = mockCreateEntity.mock.calls[0][0]
      expect(entityData).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: '_type', reference: '686917401749f351b9c82f58' }),
        expect.objectContaining({ type: '_inheritrights', boolean: true }),
        expect.objectContaining({ type: 'ulesanne', reference: 'task1' }),
        expect.objectContaining({ type: 'vastus', string: 'My answer' }),
        expect.objectContaining({ type: 'vastaja', string: 'Test Student' })
      ]))
    })

    it('should include GPS coordinates when provided', async () => {
      mockGetEntity.mockResolvedValueOnce({ entity: { _id: 'task1' } })
      mockCreateEntity.mockResolvedValueOnce({ _id: 'new-response-123' })

      const { createTaskResponse } = useTaskResponseCreation()
      await createTaskResponse({
        taskId: 'task1',
        responses: [{
          value: 'My answer',
          metadata: {
            coordinates: { lat: 59.437, lng: 24.745 }
          }
        }]
      })

      const entityData = mockCreateEntity.mock.calls[0][0]
      expect(entityData).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'seadme_gps', string: '59.437,24.745' })
      ]))
    })

    it('should include selected location when provided', async () => {
      mockGetEntity.mockResolvedValueOnce({ entity: { _id: 'task1' } })
      mockCreateEntity.mockResolvedValueOnce({ _id: 'new-response-123' })

      const { createTaskResponse } = useTaskResponseCreation()
      await createTaskResponse({
        taskId: 'task1',
        responses: [{
          value: 'My answer',
          metadata: { locationId: 'location-abc' }
        }]
      })

      const entityData = mockCreateEntity.mock.calls[0][0]
      expect(entityData).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'valitud_asukoht', reference: 'location-abc' })
      ]))
    })

    it('should handle createEntity failure', async () => {
      mockGetEntity.mockResolvedValueOnce({ entity: { _id: 'task1' } })
      mockCreateEntity.mockRejectedValueOnce(new Error('Create failed'))

      const { createTaskResponse } = useTaskResponseCreation()

      await expect(createTaskResponse({
        taskId: 'task1',
        responses: [{ value: 'My answer' }]
      })).rejects.toThrow('Client-side response creation failed')
    })

    it('should continue even if group leader lookup fails', async () => {
      mockGetEntity.mockRejectedValueOnce(new Error('Task lookup failed'))
      mockCreateEntity.mockResolvedValueOnce({ _id: 'new-response-123' })

      const { createTaskResponse } = useTaskResponseCreation()
      const result = await createTaskResponse({
        taskId: 'task1',
        responses: [{ value: 'My answer' }]
      })

      expect(result.success).toBe(true)
    })
  })
})
