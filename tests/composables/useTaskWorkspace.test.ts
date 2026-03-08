/**
 * Tests for useTaskWorkspace composable
 * Tests singleton state management, task loading, selection, and user response persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, computed } from 'vue'

// ============================================================================
// Mock Nuxt auto-imports and dependencies
// ============================================================================

const mockToken = ref<string | null>('test-token')
const mockUser = ref<any>({ _id: 'user123', name: 'Test Student' })

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

const mockRouterPush = vi.fn()
const mockRouteQuery = ref<Record<string, string>>({})

vi.stubGlobal('useRouter', () => ({ push: mockRouterPush }))
vi.stubGlobal('useRoute', () => ({
  query: mockRouteQuery.value,
  fullPath: '/'
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    entuUrl: 'https://entu.app',
    entuAccount: 'esmuuseum'
  }
}))

const mockSearchEntities = vi.fn()

vi.stubGlobal('useEntuAuth', () => ({
  token: mockToken,
  user: mockUser,
  isAuthenticated: computed(() => !!mockToken.value),
  refreshToken: vi.fn()
}))

vi.stubGlobal('useEntuApi', () => ({
  searchEntities: mockSearchEntities
}))

// Mock $fetch for loadUserResponse server call
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock localStorage
const localStorageData: Record<string, string> = {}
const mockLocalStorage = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => { localStorageData[key] = value }),
  removeItem: vi.fn((key: string) => { Reflect.deleteProperty(localStorageData, key) }),
  clear: vi.fn(() => { Object.keys(localStorageData).forEach((k) => Reflect.deleteProperty(localStorageData, k)) })
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Mock watch (Nuxt auto-import)
vi.stubGlobal('watch', vi.fn())

// We need to reset module state between tests since useTaskWorkspace uses module-level refs
let useTaskWorkspace: any

describe('useTaskWorkspace', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    Object.keys(localStorageData).forEach((k) => Reflect.deleteProperty(localStorageData, k))
    mockToken.value = 'test-token'
    mockUser.value = { _id: 'user123', name: 'Test Student' }
    mockRouteQuery.value = {}

    // Re-import to reset module-level state
    vi.resetModules()

    // Re-stub globals after resetModules
    vi.stubGlobal('useClientLogger', () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }))

    vi.stubGlobal('useRouter', () => ({ push: mockRouterPush }))
    vi.stubGlobal('useRoute', () => ({
      query: mockRouteQuery.value,
      fullPath: '/'
    }))

    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        entuUrl: 'https://entu.app',
        entuAccount: 'esmuuseum'
      }
    }))

    vi.stubGlobal('useEntuAuth', () => ({
      token: mockToken,
      user: mockUser,
      isAuthenticated: computed(() => !!mockToken.value),
      refreshToken: vi.fn()
    }))

    vi.stubGlobal('useEntuApi', () => ({
      searchEntities: mockSearchEntities
    }))

    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('watch', vi.fn())

    const mod = await import('../../app/composables/useTaskWorkspace')
    useTaskWorkspace = mod.useTaskWorkspace
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty tasks and no selection', () => {
      const { tasks, selectedTaskId, loading, error, initialized } = useTaskWorkspace()

      expect(tasks.value).toEqual([])
      expect(selectedTaskId.value).toBe(null)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(initialized.value).toBe(false)
    })
  })

  describe('loadTasks', () => {
    it('should load tasks from Entu API', async () => {
      const mockTasks = {
        entities: [
          { _id: 'task1', name: [{ string: 'Task 1' }], grupp: [{ reference: 'g1', string: 'Group A' }] },
          { _id: 'task2', name: [{ string: 'Task 2' }] }
        ]
      }
      mockSearchEntities.mockResolvedValueOnce(mockTasks)

      const { loadTasks, tasks, loading } = useTaskWorkspace()

      await loadTasks()

      expect(mockSearchEntities).toHaveBeenCalledWith({
        '_type.string': 'ulesanne',
        limit: 1000
      })
      expect(tasks.value).toHaveLength(2)
      expect(loading.value).toBe(false)
    })

    it('should extract group info from task entities', async () => {
      const mockTasks = {
        entities: [
          { _id: 'task1', name: [{ string: 'Task 1' }], grupp: [{ reference: 'group-id-1', string: 'Class 9A' }] }
        ]
      }
      mockSearchEntities.mockResolvedValueOnce(mockTasks)

      const { loadTasks, tasks } = useTaskWorkspace()
      await loadTasks()

      expect(tasks.value[0].groupId).toBe('group-id-1')
      expect(tasks.value[0].groupName).toBe('Class 9A')
    })

    it('should handle null groupId when no group assigned', async () => {
      const mockTasks = {
        entities: [
          { _id: 'task1', name: [{ string: 'Task 1' }] }
        ]
      }
      mockSearchEntities.mockResolvedValueOnce(mockTasks)

      const { loadTasks, tasks } = useTaskWorkspace()
      await loadTasks()

      expect(tasks.value[0].groupId).toBe(null)
      expect(tasks.value[0].groupName).toBe(null)
    })

    it('should set empty tasks when no user ID', async () => {
      mockUser.value = null

      const { loadTasks, tasks } = useTaskWorkspace()
      await loadTasks()

      expect(tasks.value).toEqual([])
      expect(mockSearchEntities).not.toHaveBeenCalled()
    })

    it('should set empty tasks when no token', async () => {
      mockToken.value = null

      const { loadTasks, tasks } = useTaskWorkspace()
      await loadTasks()

      expect(tasks.value).toEqual([])
      expect(mockSearchEntities).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      mockSearchEntities.mockRejectedValueOnce(new Error('Network error'))

      const { loadTasks, error, loading } = useTaskWorkspace()
      await loadTasks()

      expect(error.value).toBe('Network error')
      expect(loading.value).toBe(false)
    })

    it('should handle empty API response', async () => {
      mockSearchEntities.mockResolvedValueOnce({ entities: [] })

      const { loadTasks, tasks } = useTaskWorkspace()
      await loadTasks()

      expect(tasks.value).toEqual([])
    })
  })

  describe('selectTask', () => {
    it('should update selectedTaskId', () => {
      const { selectTask, selectedTaskId } = useTaskWorkspace()

      selectTask('task-123')

      expect(selectedTaskId.value).toBe('task-123')
    })

    it('should not trigger router navigation', () => {
      const { selectTask } = useTaskWorkspace()

      selectTask('task-123')

      expect(mockRouterPush).not.toHaveBeenCalled()
    })
  })

  describe('navigateToTask', () => {
    it('should update state and navigate', () => {
      const { navigateToTask, selectedTaskId } = useTaskWorkspace()

      navigateToTask('task-456')

      expect(selectedTaskId.value).toBe('task-456')
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/',
          query: expect.objectContaining({ task: 'task-456' })
        })
      )
    })
  })

  describe('saveUserResponse', () => {
    it('should save response to memory and localStorage', () => {
      const { saveUserResponse } = useTaskWorkspace()

      const response = { textResponse: 'My answer', timestamp: Date.now() }
      saveUserResponse('task-1', response)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'taskResponses',
        expect.any(String)
      )

      const stored = JSON.parse(mockLocalStorage.setItem.mock.calls[0]![1])
      expect(stored['task-1']).toEqual(response)
    })
  })

  describe('loadUserResponse', () => {
    it('should return response from memory if available', async () => {
      const { saveUserResponse, loadUserResponse } = useTaskWorkspace()

      const response = { textResponse: 'Cached answer' }
      saveUserResponse('task-1', response)

      const result = await loadUserResponse('task-1')
      expect(result).toEqual(response)
    })

    it('should fall back to localStorage', async () => {
      const stored = { 'task-2': { textResponse: 'Stored answer' } }
      localStorageData.taskResponses = JSON.stringify(stored)

      const { loadUserResponse } = useTaskWorkspace()
      const result = await loadUserResponse('task-2')

      expect(result).toEqual({ textResponse: 'Stored answer' })
    })

    it('should return null when no response exists', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not found'))

      const { loadUserResponse } = useTaskWorkspace()
      const result = await loadUserResponse('task-nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('singleton state', () => {
    it('should share state between multiple calls', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [{ _id: 'task1', name: [{ string: 'Task 1' }] }]
      })

      const workspace1 = useTaskWorkspace()
      await workspace1.loadTasks()

      const workspace2 = useTaskWorkspace()

      // Both should see the same tasks (module-level refs)
      expect(workspace2.tasks.value).toHaveLength(1)
      expect(workspace2.tasks.value[0]._id).toBe('task1')
    })
  })

  describe('computed properties', () => {
    it('should compute selectedTask from selectedTaskId', async () => {
      mockSearchEntities.mockResolvedValueOnce({
        entities: [
          { _id: 'task1', name: [{ string: 'Task 1' }] },
          { _id: 'task2', name: [{ string: 'Task 2' }] }
        ]
      })

      const { loadTasks, selectTask, selectedTask, isTaskSelected } = useTaskWorkspace()
      await loadTasks()

      expect(isTaskSelected.value).toBe(false)

      selectTask('task2')

      expect(isTaskSelected.value).toBe(true)
      expect(selectedTask.value?._id).toBe('task2')
    })
  })
})
