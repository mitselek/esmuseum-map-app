/**
 * Tests for useTaskDetail composable
 * Tests: parseCoordinates, checkTaskPermissions, initializeTask, loadTaskLocations, loadExistingResponse
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { mockTokens, mockUsers } from '../mocks/jwt-tokens'

// ============================================================================
// Mock Nuxt auto-imports
// ============================================================================

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

vi.stubGlobal('useI18n', () => ({
  t: (key: string, params?: Record<string, string>) => {
    if (params) return `${key}: ${JSON.stringify(params)}`
    return key
  }
}))

const mockToken = ref<string | null>(mockTokens.valid)
const mockUser = ref<any>({ _id: mockUsers.student._id, name: 'Test Student' })

vi.stubGlobal('useEntuAuth', () => ({
  token: mockToken,
  user: mockUser,
  isAuthenticated: computed(() => !!mockToken.value),
  refreshToken: vi.fn()
}))

const mockGetEntity = vi.fn()
const mockSearchEntities = vi.fn()

vi.stubGlobal('useEntuApi', () => ({
  getEntity: mockGetEntity,
  searchEntities: mockSearchEntities
}))

const mockLoadMapLocations = vi.fn()
const mockSortByDistance = vi.fn((locations: any[]) => locations)

vi.stubGlobal('useLocation', () => ({
  loadMapLocations: mockLoadMapLocations,
  sortByDistance: mockSortByDistance
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: { entuUrl: 'https://api.entu.app', entuAccount: 'esmuuseum' }
}))

vi.stubGlobal('useRouter', () => ({ push: vi.fn() }))
vi.stubGlobal('useRoute', () => ({ fullPath: '/' }))

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock imports
vi.mock('~~/utils/entu-query-builders', () => ({
  buildResponsesByTaskQuery: vi.fn((taskId: string) => ({
    '_type.string': 'vastus',
    'ulesanne.reference': taskId
  }))
}))

const { useTaskDetail } = await import('../../app/composables/useTaskDetail')

// ============================================================================
// Tests
// ============================================================================

describe('useTaskDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken.value = mockTokens.valid
    mockUser.value = { _id: mockUsers.student._id, name: 'Test Student' }
  })

  describe('parseCoordinates', () => {
    it('should parse valid coordinate string', () => {
      const { parseCoordinates } = useTaskDetail()
      const result = parseCoordinates('59.437,24.745')

      expect(result).toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should parse coordinates with spaces', () => {
      const { parseCoordinates } = useTaskDetail()
      const result = parseCoordinates('59.437 , 24.745')

      expect(result).toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should return null for null/undefined input', () => {
      const { parseCoordinates } = useTaskDetail()

      expect(parseCoordinates(null)).toBeNull()
      expect(parseCoordinates(undefined)).toBeNull()
      expect(parseCoordinates('')).toBeNull()
    })

    it('should return null for invalid coordinate format', () => {
      const { parseCoordinates } = useTaskDetail()

      expect(parseCoordinates('not,numbers')).toBeNull()
      expect(parseCoordinates('59.437')).toBeNull()
      expect(parseCoordinates('59.437,24.745,100')).toBeNull()
    })

    it('should return null for out-of-range coordinates', () => {
      const { parseCoordinates } = useTaskDetail()

      expect(parseCoordinates('91,24.745')).toBeNull() // lat > 90
      expect(parseCoordinates('-91,24.745')).toBeNull() // lat < -90
      expect(parseCoordinates('59.437,181')).toBeNull() // lng > 180
      expect(parseCoordinates('59.437,-181')).toBeNull() // lng < -180
    })

    it('should accept boundary coordinates', () => {
      const { parseCoordinates } = useTaskDetail()

      expect(parseCoordinates('90,180')).toEqual({ lat: 90, lng: 180 })
      expect(parseCoordinates('-90,-180')).toEqual({ lat: -90, lng: -180 })
      expect(parseCoordinates('0,0')).toEqual({ lat: 0, lng: 0 })
    })
  })

  describe('checkTaskPermissions', () => {
    it('should return no permission when not authenticated', async () => {
      mockToken.value = null

      const { checkTaskPermissions } = useTaskDetail()
      const result = await checkTaskPermissions('task123')

      expect(result.hasPermission).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })

    it('should return permission when user is in _owner array', async () => {
      mockGetEntity.mockResolvedValueOnce({
        _id: 'task123',
        _owner: [{ reference: mockUsers.student._id }],
        _editor: [],
        _expander: []
      })

      const { checkTaskPermissions } = useTaskDetail()
      const result = await checkTaskPermissions('task123')

      expect(result.hasPermission).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should return permission when user is in _expander array', async () => {
      mockGetEntity.mockResolvedValueOnce({
        _id: 'task123',
        _owner: [],
        _editor: [],
        _expander: [{ reference: mockUsers.student._id }]
      })

      const { checkTaskPermissions } = useTaskDetail()
      const result = await checkTaskPermissions('task123')

      expect(result.hasPermission).toBe(true)
    })

    it('should return no permission when user not in any permission array', async () => {
      mockGetEntity.mockResolvedValueOnce({
        _id: 'task123',
        _owner: [{ reference: 'other-user' }],
        _editor: [],
        _expander: []
      })

      const { checkTaskPermissions } = useTaskDetail()
      const result = await checkTaskPermissions('task123')

      expect(result.hasPermission).toBe(false)
      expect(result.error).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      mockGetEntity.mockRejectedValueOnce(new Error('Network error'))

      const { checkTaskPermissions } = useTaskDetail()
      const result = await checkTaskPermissions('task123')

      expect(result.hasPermission).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle entity wrapped in entity property', async () => {
      mockGetEntity.mockResolvedValueOnce({
        entity: {
          _id: 'task123',
          _owner: [{ reference: mockUsers.student._id }],
          _editor: [],
          _expander: []
        }
      })

      const { checkTaskPermissions } = useTaskDetail()
      const result = await checkTaskPermissions('task123')

      expect(result.hasPermission).toBe(true)
    })
  })

  describe('loadTaskLocations', () => {
    it('should load locations for task with map reference', async () => {
      const mockLocations = [
        { _id: 'loc1', name: 'Location 1', coordinates: { lat: 59.437, lng: 24.745 } }
      ]
      mockLoadMapLocations.mockResolvedValueOnce(mockLocations)

      const task = {
        _id: 'task1',
        name: [{ string: 'Test Task' }],
        kaart: [{ reference: 'map123' }]
      } as any

      const { loadTaskLocations } = useTaskDetail()
      const result = await loadTaskLocations(task, null)

      expect(mockLoadMapLocations).toHaveBeenCalledWith('map123')
      expect(result).toEqual(mockLocations)
    })

    it('should return empty array when task has no map', async () => {
      const task = {
        _id: 'task1',
        name: [{ string: 'Test Task' }]
      } as any

      const { loadTaskLocations } = useTaskDetail()
      const result = await loadTaskLocations(task, null)

      expect(result).toEqual([])
    })

    it('should sort by distance when user position is provided', async () => {
      const mockLocations = [{ _id: 'loc1' }, { _id: 'loc2' }]
      mockLoadMapLocations.mockResolvedValueOnce(mockLocations)

      const task = {
        _id: 'task1',
        name: [{ string: 'Test Task' }],
        kaart: [{ reference: 'map123' }]
      } as any

      const userPosition = { lat: 59.437, lng: 24.745 }

      const { loadTaskLocations } = useTaskDetail()
      await loadTaskLocations(task, userPosition)

      expect(mockSortByDistance).toHaveBeenCalledWith(mockLocations, userPosition)
    })
  })

  describe('initializeTask', () => {
    it('should return no_task when task is null', async () => {
      const { initializeTask } = useTaskDetail()
      const result = await initializeTask(null)

      expect(result.success).toBe(false)
      expect(result.reason).toBe('no_task')
    })

    it('should return no_task_id when task has no _id', async () => {
      const { initializeTask } = useTaskDetail()
      const result = await initializeTask({ name: [{ string: 'Test' }] } as any)

      expect(result.success).toBe(false)
      expect(result.reason).toBe('no_task_id')
    })

    it('should call resetState when task is null and resetState is provided', async () => {
      const resetState = vi.fn()

      const { initializeTask } = useTaskDetail()
      await initializeTask(null, { resetState })

      expect(resetState).toHaveBeenCalled()
    })

    it('should return authenticated=false when no token', async () => {
      mockToken.value = null

      const task = { _id: 'task1', name: [{ string: 'Test' }] } as any

      const { initializeTask } = useTaskDetail()
      const result = await initializeTask(task)

      expect(result.success).toBe(true)
      expect(result.authenticated).toBe(false)
    })

    it('should detect existing response', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [{ _id: 'response1', vastus: [{ string: 'My answer' }] }]
      })

      const task = { _id: 'task1', name: [{ string: 'Test' }] } as any

      const { initializeTask } = useTaskDetail()
      const result = await initializeTask(task)

      expect(result.success).toBe(true)
      expect(result.hasExistingResponse).toBe(true)
      expect(result.response).toBeDefined()
    })

    it('should return hasExistingResponse=false when no response exists', async () => {
      mockSearchEntities.mockResolvedValueOnce({ entities: [] })

      const task = { _id: 'task1', name: [{ string: 'Test' }] } as any

      const { initializeTask } = useTaskDetail()
      const result = await initializeTask(task)

      expect(result.success).toBe(true)
      expect(result.hasExistingResponse).toBe(false)
    })
  })

  describe('loadExistingResponse', () => {
    it('should return null for empty taskId', async () => {
      const { loadExistingResponse } = useTaskDetail()
      const result = await loadExistingResponse('')

      expect(result).toBeNull()
    })

    it('should return null when not authenticated', async () => {
      mockToken.value = null

      const { loadExistingResponse } = useTaskDetail()
      const result = await loadExistingResponse('task123')

      expect(result).toBeNull()
    })

    it('should return response data on success', async () => {
      const mockResponse = { success: true, response: { _id: 'r1', vastus: [{ string: 'answer' }] } }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const { loadExistingResponse } = useTaskDetail()
      const result = await loadExistingResponse('task123')

      expect(result).toEqual(mockResponse.response)
    })

    it('should return null on API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not found'))

      const { loadExistingResponse } = useTaskDetail()
      const result = await loadExistingResponse('task123')

      expect(result).toBeNull()
    })
  })

  describe('handleAutoGeolocation', () => {
    it('should call getCurrentLocation when needsLocation is true', async () => {
      const getCurrentLocation = vi.fn().mockResolvedValue(undefined)
      const needsLocation = { value: true }

      const { handleAutoGeolocation } = useTaskDetail()
      await handleAutoGeolocation(needsLocation, getCurrentLocation, null)

      expect(getCurrentLocation).toHaveBeenCalled()
    })

    it('should not call getCurrentLocation when needsLocation is false', async () => {
      const getCurrentLocation = vi.fn()
      const needsLocation = { value: false }

      const { handleAutoGeolocation } = useTaskDetail()
      await handleAutoGeolocation(needsLocation, getCurrentLocation, null)

      expect(getCurrentLocation).not.toHaveBeenCalled()
    })

    it('should handle geolocation failure gracefully', async () => {
      const getCurrentLocation = vi.fn().mockRejectedValue(new Error('GPS failed'))
      const needsLocation = { value: true }

      const { handleAutoGeolocation } = useTaskDetail()
      // Should not throw
      await handleAutoGeolocation(needsLocation, getCurrentLocation, null)
    })
  })
})
