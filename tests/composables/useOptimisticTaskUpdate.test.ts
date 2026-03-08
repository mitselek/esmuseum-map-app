/**
 * Tests for useOptimisticTaskUpdate composable
 * Tests: refetchTask
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// ============================================================================
// Mock Nuxt auto-imports
// ============================================================================

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

const mockGetEntity = vi.fn()
const mockLoadCompletedTasks = vi.fn()

vi.stubGlobal('useEntuApi', () => ({
  getEntity: mockGetEntity
}))

vi.stubGlobal('useCompletedTasks', () => ({
  loadCompletedTasks: mockLoadCompletedTasks
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: { entuUrl: 'https://entu.app', entuAccount: 'esmuuseum' }
}))

const { useOptimisticTaskUpdate } = await import('../../app/composables/useOptimisticTaskUpdate')

// ============================================================================
// Tests
// ============================================================================

describe('useOptimisticTaskUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadCompletedTasks.mockResolvedValue([])
  })

  describe('refetchTask', () => {
    it('should fetch fresh task data and update the ref', async () => {
      const taskRef = ref<any>({ _id: 'task1', name: [{ string: 'Old Name' }] })

      mockGetEntity.mockResolvedValueOnce({
        _id: 'task1',
        name: [{ string: 'Updated Name' }],
        newProp: 'added'
      })

      const { refetchTask } = useOptimisticTaskUpdate(taskRef)
      await refetchTask('task1')

      expect(mockGetEntity).toHaveBeenCalledWith('task1')
      expect(taskRef.value.name[0].string).toBe('Updated Name')
    })

    it('should reload completed tasks after refetch', async () => {
      const taskRef = ref<any>({ _id: 'task1' })
      mockGetEntity.mockResolvedValueOnce({ _id: 'task1' })

      const { refetchTask } = useOptimisticTaskUpdate(taskRef)
      await refetchTask('task1')

      expect(mockLoadCompletedTasks).toHaveBeenCalled()
    })

    it('should throw on API failure', async () => {
      const taskRef = ref<any>({ _id: 'task1' })
      mockGetEntity.mockRejectedValueOnce(new Error('Network error'))

      const { refetchTask } = useOptimisticTaskUpdate(taskRef)

      await expect(refetchTask('task1')).rejects.toThrow('Network error')
    })

    it('should not update ref when task ref is null', async () => {
      const taskRef = ref<any>(null)

      mockGetEntity.mockResolvedValueOnce({ _id: 'task1', name: 'Fresh' })

      const { refetchTask } = useOptimisticTaskUpdate(taskRef)
      await refetchTask('task1')

      // Should not crash, just skip the update
      expect(taskRef.value).toBeNull()
    })
  })
})
