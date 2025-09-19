/**
 * Test suite for F012 scoring mechanism
 * Tests the useTaskScoring composable functionality
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
// Mock the composables first
const mockApiGet = vi.fn()
const mockUser = ref({ _id: 'test-user-id' })

vi.mock('../../app/composables/useEntuApi', () => ({
  useEntuApi: () => ({
    searchEntities: mockApiGet
  })
}))

vi.mock('../../app/composables/useEntuAuth', () => ({
  useEntuAuth: () => ({
    user: mockUser
  })
}))

const { useTaskScoring } = await import('../../app/composables/useTaskScoring')

describe('useTaskScoring', () => {
  const mockTask = ref({
    _id: 'test-task-id',
    vastuseid: [{ number: 25 }]
  })

  const mockResponses = [
    {
      _id: 'response-1',
      _type: [{ string: 'vastus' }],
      _parent: [{ reference: 'test-task-id' }],
      _owner: [{ reference: 'test-user-id' }],
      asukoht: [{ reference: 'location-1' }]
    },
    {
      _id: 'response-2',
      _type: [{ string: 'vastus' }],
      _parent: [{ reference: 'test-task-id' }],
      _owner: [{ reference: 'test-user-id' }],
      asukoht: [{ reference: 'location-2' }]
    },
    // Duplicate location to test uniqueness
    {
      _id: 'response-3',
      _type: [{ string: 'vastus' }],
      _parent: [{ reference: 'test-task-id' }],
      _owner: [{ reference: 'test-user-id' }],
      asukoht: [{ reference: 'location-1' }]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockApiGet.mockResolvedValue({ entities: mockResponses })
  })

  it('should calculate correct unique location count', async () => {
    const scoring = useTaskScoring(mockTask)

    await nextTick()

    // Should count only unique locations (location-1 and location-2)
    expect(scoring.uniqueLocationsCount.value).toBe(2)
  })

  it('should get total expected from task data', () => {
    const scoring = useTaskScoring(mockTask)

    expect(scoring.totalExpected.value).toBe(25)
  })

  it('should calculate progress percentage correctly', async () => {
    const scoring = useTaskScoring(mockTask)

    await nextTick()

    // 2 unique locations out of 25 = 8%
    expect(scoring.progressPercent.value).toBe(8)
  })

  it('should generate correct progress text', async () => {
    const scoring = useTaskScoring(mockTask)

    await nextTick()

    expect(scoring.progressText.value).toBe('2 of 25')
  })

  it('should identify visited locations correctly', async () => {
    const scoring = useTaskScoring(mockTask)

    await nextTick()

    expect(scoring.isLocationVisited('location-1')).toBe(true)
    expect(scoring.isLocationVisited('location-2')).toBe(true)
    expect(scoring.isLocationVisited('location-3')).toBe(false)
  })

  it('should add optimistic responses correctly', async () => {
    const scoring = useTaskScoring(mockTask)

    await nextTick()

    const initialCount = scoring.uniqueLocationsCount.value

    // Add optimistic response for new location
    scoring.addResponseOptimistically('location-3', { kirjeldus: 'test response' })

    await nextTick()

    expect(scoring.uniqueLocationsCount.value).toBe(initialCount + 1)
    expect(scoring.isLocationVisited('location-3')).toBe(true)
  })

  it('should not duplicate optimistic responses for same location', async () => {
    const scoring = useTaskScoring(mockTask)

    await nextTick()

    const initialCount = scoring.uniqueLocationsCount.value

    // Try to add optimistic response for existing location
    scoring.addResponseOptimistically('location-1', { kirjeldus: 'duplicate' })

    await nextTick()

    // Count should not change
    expect(scoring.uniqueLocationsCount.value).toBe(initialCount)
  })

  it('should handle missing task data gracefully', () => {
    const emptyTask = ref(null)
    const scoring = useTaskScoring(emptyTask)

    expect(scoring.totalExpected.value).toBe(0)
    expect(scoring.uniqueLocationsCount.value).toBe(0)
    expect(scoring.progressPercent.value).toBe(0)
  })

  it('should fetch responses when task changes', async () => {
    const newTask = ref(null)
    // eslint-disable-next-line no-unused-vars
    const scoring = useTaskScoring(newTask)

    // Initially should not call API
    expect(mockApiGet).not.toHaveBeenCalled()

    // Set task
    newTask.value = mockTask.value

    await nextTick()

    // Should now call API
    expect(mockApiGet).toHaveBeenCalledWith('/entity', {
      params: {
        '_type.string': 'vastus',
        '_parent.reference': 'test-task-id',
        '_owner.reference': 'test-user-id'
      }
    })
  })
})
