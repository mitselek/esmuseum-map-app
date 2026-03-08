/**
 * Tests for server/utils/webhook-queue.ts
 *
 * Pure state machine — enqueue, complete, stats, cleanup
 */
import { describe, it, expect, vi } from 'vitest'

// Mock createLogger before importing the module
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// Must re-import fresh module per test to reset in-memory Map
async function loadModule () {
  vi.resetModules()
  // Re-apply mock after resetModules
  vi.mock('../../../server/utils/logger', () => ({
    createLogger: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  }))
  return await import('../../../server/utils/webhook-queue')
}

describe('webhook-queue', () => {
  describe('enqueueWebhook', () => {
    it('should return true for a new entity (start processing)', async () => {
      const { enqueueWebhook } = await loadModule()
      expect(enqueueWebhook('entity-1')).toBe(true)
    })

    it('should return false when entity is already processing', async () => {
      const { enqueueWebhook } = await loadModule()
      enqueueWebhook('entity-1') // first call starts processing
      expect(enqueueWebhook('entity-1')).toBe(false)
    })

    it('should mark entity for reprocessing on duplicate enqueue', async () => {
      const { enqueueWebhook, getQueueStats } = await loadModule()
      enqueueWebhook('entity-1')
      enqueueWebhook('entity-1') // duplicate

      const stats = getQueueStats()
      expect(stats.needsReprocessing).toBe(1)
    })

    it('should handle multiple different entities independently', async () => {
      const { enqueueWebhook, getQueueStats } = await loadModule()
      expect(enqueueWebhook('entity-1')).toBe(true)
      expect(enqueueWebhook('entity-2')).toBe(true)
      expect(getQueueStats().totalQueued).toBe(2)
    })
  })

  describe('completeWebhookProcessing', () => {
    it('should return false for non-queued entity', async () => {
      const { completeWebhookProcessing } = await loadModule()
      expect(completeWebhookProcessing('unknown')).toBe(false)
    })

    it('should remove entity from queue when no reprocessing needed', async () => {
      const { enqueueWebhook, completeWebhookProcessing, getQueueStats } = await loadModule()
      enqueueWebhook('entity-1')
      const needsReprocess = completeWebhookProcessing('entity-1')

      expect(needsReprocess).toBe(false)
      expect(getQueueStats().totalQueued).toBe(0)
    })

    it('should return true when reprocessing is needed', async () => {
      const { enqueueWebhook, completeWebhookProcessing } = await loadModule()
      enqueueWebhook('entity-1')
      enqueueWebhook('entity-1') // mark for reprocessing

      const needsReprocess = completeWebhookProcessing('entity-1')
      expect(needsReprocess).toBe(true)
    })

    it('should reset reprocessing flag after returning true', async () => {
      const { enqueueWebhook, completeWebhookProcessing, getQueueStats } = await loadModule()
      enqueueWebhook('entity-1')
      enqueueWebhook('entity-1') // mark for reprocessing

      completeWebhookProcessing('entity-1') // returns true, resets flag
      expect(getQueueStats().needsReprocessing).toBe(0)
    })

    it('should keep entity in queue during reprocessing', async () => {
      const { enqueueWebhook, completeWebhookProcessing, getQueueStats } = await loadModule()
      enqueueWebhook('entity-1')
      enqueueWebhook('entity-1')
      completeWebhookProcessing('entity-1')

      expect(getQueueStats().totalQueued).toBe(1)
      expect(getQueueStats().processing).toBe(1)
    })
  })

  describe('getQueueStats', () => {
    it('should return zeros for empty queue', async () => {
      const { getQueueStats } = await loadModule()
      expect(getQueueStats()).toEqual({
        totalQueued: 0,
        processing: 0,
        needsReprocessing: 0
      })
    })

    it('should count processing and reprocessing separately', async () => {
      const { enqueueWebhook, getQueueStats } = await loadModule()
      enqueueWebhook('entity-1')
      enqueueWebhook('entity-2')
      enqueueWebhook('entity-2') // mark entity-2 for reprocessing

      const stats = getQueueStats()
      expect(stats.totalQueued).toBe(2)
      expect(stats.processing).toBe(2)
      expect(stats.needsReprocessing).toBe(1)
    })
  })

  describe('cleanStaleQueueItems', () => {
    it('should return 0 when queue is empty', async () => {
      const { cleanStaleQueueItems } = await loadModule()
      expect(cleanStaleQueueItems()).toBe(0)
    })

    it('should not remove fresh items', async () => {
      const { enqueueWebhook, cleanStaleQueueItems, getQueueStats } = await loadModule()
      enqueueWebhook('entity-1')
      expect(cleanStaleQueueItems()).toBe(0)
      expect(getQueueStats().totalQueued).toBe(1)
    })

    it('should remove items older than 5 minutes', async () => {
      const { enqueueWebhook, cleanStaleQueueItems, getQueueStats } = await loadModule()
      enqueueWebhook('entity-1')

      // Advance time by 6 minutes
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60 * 1000)

      const cleaned = cleanStaleQueueItems()
      expect(cleaned).toBe(1)
      expect(getQueueStats().totalQueued).toBe(0)

      vi.restoreAllMocks()
    })

    it('should only remove stale items, keep fresh ones', async () => {
      const { enqueueWebhook, cleanStaleQueueItems, getQueueStats } = await loadModule()
      const baseTime = Date.now()

      enqueueWebhook('stale-entity')

      // Advance time, then add a fresh entity
      const futureTime = baseTime + 6 * 60 * 1000
      vi.spyOn(Date, 'now').mockReturnValue(futureTime)
      enqueueWebhook('fresh-entity')

      const cleaned = cleanStaleQueueItems()
      expect(cleaned).toBe(1)
      expect(getQueueStats().totalQueued).toBe(1)

      vi.restoreAllMocks()
    })
  })

  describe('full lifecycle', () => {
    it('should handle enqueue → complete → remove cycle', async () => {
      const { enqueueWebhook, completeWebhookProcessing, getQueueStats } = await loadModule()

      // Enqueue
      expect(enqueueWebhook('entity-1')).toBe(true)
      expect(getQueueStats().processing).toBe(1)

      // Complete
      expect(completeWebhookProcessing('entity-1')).toBe(false)
      expect(getQueueStats().totalQueued).toBe(0)
    })

    it('should handle enqueue → duplicate → complete → reprocess → complete cycle', async () => {
      const { enqueueWebhook, completeWebhookProcessing, getQueueStats } = await loadModule()

      expect(enqueueWebhook('entity-1')).toBe(true)
      expect(enqueueWebhook('entity-1')).toBe(false) // duplicate during processing

      expect(completeWebhookProcessing('entity-1')).toBe(true) // needs reprocessing
      expect(getQueueStats().processing).toBe(1)

      expect(completeWebhookProcessing('entity-1')).toBe(false) // done
      expect(getQueueStats().totalQueued).toBe(0)
    })
  })
})
