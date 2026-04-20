/**
 * Tests for useCompletedTasks composable
 * Tests: loadCompletedTasks, getTaskStats, getVisitedLocationsForTask, isLocationVisited
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
const mockUser = ref<any>({ _id: 'user123', name: 'Test Student' })
const mockSearchEntities = vi.fn()

vi.stubGlobal('useEntuAuth', () => ({
  token: mockToken,
  user: mockUser,
  isAuthenticated: computed(() => !!mockToken.value)
}))

vi.stubGlobal('useEntuApi', () => ({
  searchEntities: mockSearchEntities
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: { entuUrl: 'https://api.entu.app', entuAccount: 'esmuuseum' }
}))

// Need to reset module state between tests
let useCompletedTasks: any

describe('useCompletedTasks', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockToken.value = 'test-token'
    mockUser.value = { _id: 'user123', name: 'Test Student' }

    // Reset module to clear singleton state
    vi.resetModules()

    vi.stubGlobal('readonly', readonly)
    vi.stubGlobal('useClientLogger', () => ({
      debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()
    }))
    vi.stubGlobal('useEntuAuth', () => ({
      token: mockToken,
      user: mockUser,
      isAuthenticated: computed(() => !!mockToken.value)
    }))
    vi.stubGlobal('useEntuApi', () => ({
      searchEntities: mockSearchEntities
    }))

    const mod = await import('../../app/composables/useCompletedTasks')
    useCompletedTasks = mod.useCompletedTasks
  })

  describe('initial state', () => {
    it('should initialize with empty state', () => {
      const { completedTaskIds, userResponses, loading, error } = useCompletedTasks()

      expect(completedTaskIds.value).toEqual([])
      expect(userResponses.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('loadCompletedTasks', () => {
    it('should load user responses and extract task IDs', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] },
          { _id: 'r2', ulesanne: [{ reference: 'task2' }], valitud_asukoht: [{ reference: 'loc2' }] },
          { _id: 'r3', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc3' }] }
        ]
      })

      const { loadCompletedTasks, completedTaskIds, userResponses } = useCompletedTasks()
      const result = await loadCompletedTasks()

      expect(result).toContain('task1')
      expect(result).toContain('task2')
      expect(completedTaskIds.value).toContain('task1')
      expect(completedTaskIds.value).toContain('task2')
      expect(userResponses.value).toHaveLength(3)
    })

    it('should return empty array when no token', async () => {
      mockToken.value = null

      const { loadCompletedTasks } = useCompletedTasks()
      const result = await loadCompletedTasks()

      expect(result).toEqual([])
      expect(mockSearchEntities).not.toHaveBeenCalled()
    })

    it('should return empty array when no user ID', async () => {
      mockUser.value = null

      const { loadCompletedTasks } = useCompletedTasks()
      const result = await loadCompletedTasks()

      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      mockSearchEntities.mockRejectedValueOnce(new Error('Network error'))

      const { loadCompletedTasks, error, loading } = useCompletedTasks()
      const result = await loadCompletedTasks()

      expect(result).toEqual([])
      expect(error.value).toBeTruthy()
      expect(loading.value).toBe(false)
    })

    it('should handle empty API response', async () => {
      mockSearchEntities.mockResolvedValueOnce({ entities: [] })

      const { loadCompletedTasks, completedTaskIds } = useCompletedTasks()
      await loadCompletedTasks()

      expect(completedTaskIds.value).toEqual([])
    })

    it('should deduplicate task IDs', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }] },
          { _id: 'r2', ulesanne: [{ reference: 'task1' }] },
          { _id: 'r3', ulesanne: [{ reference: 'task1' }] }
        ]
      })

      const { loadCompletedTasks } = useCompletedTasks()
      const result = await loadCompletedTasks()

      expect(result).toEqual(['task1'])
    })

    it('should skip responses without task reference', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }] },
          { _id: 'r2' }, // No ulesanne
          { _id: 'r3', ulesanne: [] } // Empty ulesanne
        ]
      })

      const { loadCompletedTasks } = useCompletedTasks()
      const result = await loadCompletedTasks()

      expect(result).toEqual(['task1'])
    })
  })

  describe('getTaskStats', () => {
    it('should calculate stats based on unique locations', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] },
          { _id: 'r2', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc2' }] },
          { _id: 'r3', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] } // duplicate loc
        ]
      })

      const { loadCompletedTasks, getTaskStats } = useCompletedTasks()
      await loadCompletedTasks()

      const stats = getTaskStats('task1', 5)

      expect(stats.actual).toBe(2) // 2 unique locations
      expect(stats.expected).toBe(5)
      expect(stats.progress).toBe(40) // 2/5 = 40%
    })

    it('should return zero stats for unknown task', () => {
      const { getTaskStats } = useCompletedTasks()
      const stats = getTaskStats('unknown-task', 10)

      expect(stats.actual).toBe(0)
      expect(stats.expected).toBe(10)
      expect(stats.progress).toBe(0)
    })

    it('should handle zero expected count', () => {
      const { getTaskStats } = useCompletedTasks()
      const stats = getTaskStats('task1', 0)

      expect(stats.expected).toBe(1) // Falls back to 1
      expect(stats.progress).toBe(0)
    })
  })

  describe('getVisitedLocationsForTask', () => {
    it('should return set of visited location references', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] },
          { _id: 'r2', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc2' }] }
        ]
      })

      const { loadCompletedTasks, getVisitedLocationsForTask } = useCompletedTasks()
      await loadCompletedTasks()

      const visited = getVisitedLocationsForTask('task1')

      expect(visited).toBeInstanceOf(Set)
      expect(visited.has('loc1')).toBe(true)
      expect(visited.has('loc2')).toBe(true)
    })

    it('should return empty set for task with no responses', () => {
      const { getVisitedLocationsForTask } = useCompletedTasks()
      const visited = getVisitedLocationsForTask('nonexistent')

      expect(visited.size).toBe(0)
    })
  })

  describe('isLocationVisited', () => {
    it('should return true for visited location', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] }
        ]
      })

      const { loadCompletedTasks, isLocationVisited } = useCompletedTasks()
      await loadCompletedTasks()

      expect(isLocationVisited('task1', 'loc1')).toBe(true)
    })

    it('should return false for unvisited location', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] }
        ]
      })

      const { loadCompletedTasks, isLocationVisited } = useCompletedTasks()
      await loadCompletedTasks()

      expect(isLocationVisited('task1', 'loc-unknown')).toBe(false)
    })
  })

  describe('singleton state', () => {
    it('should share state between instances', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'r1', ulesanne: [{ reference: 'task1' }] }
        ]
      })

      const instance1 = useCompletedTasks()
      await instance1.loadCompletedTasks()

      const instance2 = useCompletedTasks()
      expect(instance2.completedTaskIds.value).toContain('task1')
    })
  })
})

describe('useTaskScoring', () => {
  let useTaskScoring: any
  let useCompletedTasksFn: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockToken.value = 'test-token'
    mockUser.value = { _id: 'user123', name: 'Test Student' }

    vi.resetModules()

    vi.stubGlobal('readonly', readonly)
    vi.stubGlobal('useClientLogger', () => ({
      debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()
    }))
    vi.stubGlobal('useEntuAuth', () => ({
      token: mockToken,
      user: mockUser,
      isAuthenticated: computed(() => !!mockToken.value)
    }))
    vi.stubGlobal('useEntuApi', () => ({
      searchEntities: mockSearchEntities
    }))

    const mod = await import('../../app/composables/useCompletedTasks')
    useTaskScoring = mod.useTaskScoring
    useCompletedTasksFn = mod.useCompletedTasks
  })

  it('should return scoring data for a task', async () => {
    // Load some responses first
    mockSearchEntities.mockResolvedValueOnce({
      entities: [
        { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] },
        { _id: 'r2', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc2' }] }
      ]
    })

    const completedTasks = useCompletedTasksFn()
    await completedTasks.loadCompletedTasks()

    const taskData = computed(() => ({
      _id: 'task1',
      vastuseid: [{ number: 5 }]
    }))

    const scoring = useTaskScoring(taskData)

    expect(scoring.uniqueLocationsCount.value).toBe(2)
    expect(scoring.totalExpected.value).toBe(5)
    expect(scoring.progressText.value).toBe('2 of 5')
    expect(scoring.progressPercent.value).toBe(40)
  })

  it('should return zero scoring when task data is null', () => {
    const taskData = computed(() => null)
    const scoring = useTaskScoring(taskData)

    expect(scoring.uniqueLocationsCount.value).toBe(0)
    expect(scoring.totalExpected.value).toBe(0)
    expect(scoring.progressPercent.value).toBe(0)
  })

  it('should return zero scoring when task has no vastuseid', () => {
    const taskData = computed(() => ({
      _id: 'task-no-count'
    }))
    const scoring = useTaskScoring(taskData)

    expect(scoring.totalExpected.value).toBe(0)
    expect(scoring.progressPercent.value).toBe(0)
  })

  it('should check if a specific location is visited', async () => {
    mockSearchEntities.mockResolvedValueOnce({
      entities: [
        { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] }
      ]
    })

    const completedTasks = useCompletedTasksFn()
    await completedTasks.loadCompletedTasks()

    const taskData = computed(() => ({
      _id: 'task1',
      vastuseid: [{ number: 3 }]
    }))

    const scoring = useTaskScoring(taskData)

    expect(scoring.isLocationVisited('loc1')).toBe(true)
    expect(scoring.isLocationVisited('loc-unknown')).toBe(false)
  })

  it('should return false for isLocationVisited when task ID is empty', () => {
    const taskData = computed(() => null)
    const scoring = useTaskScoring(taskData)

    expect(scoring.isLocationVisited('loc1')).toBe(false)
  })

  it('should expose userResponses, loading and error from completedTasks', () => {
    const taskData = computed(() => null)
    const scoring = useTaskScoring(taskData)

    expect(scoring.userResponses).toBeDefined()
    expect(scoring.loading).toBeDefined()
    expect(scoring.error).toBeDefined()
  })

  it('should track visited locations as a computed Set', async () => {
    mockSearchEntities.mockResolvedValueOnce({
      entities: [
        { _id: 'r1', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc1' }] },
        { _id: 'r2', ulesanne: [{ reference: 'task1' }], valitud_asukoht: [{ reference: 'loc2' }] }
      ]
    })

    const completedTasks = useCompletedTasksFn()
    await completedTasks.loadCompletedTasks()

    const taskData = computed(() => ({
      _id: 'task1',
      vastuseid: [{ number: 5 }]
    }))

    const scoring = useTaskScoring(taskData)

    expect(scoring.visitedLocations.value).toBeInstanceOf(Set)
    expect(scoring.visitedLocations.value.has('loc1')).toBe(true)
    expect(scoring.visitedLocations.value.has('loc2')).toBe(true)
  })
})
