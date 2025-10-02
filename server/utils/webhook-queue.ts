/**
 * F020: Webhook Processing Queue
 * 
 * Handles webhook bursts intelligently by queuing and debouncing
 * per entity ID to avoid duplicate work and race conditions
 */

import { createLogger } from './logger'

const logger = createLogger('webhook-queue')

interface QueueItem {
  entityId: string
  timestamp: number
  processing: boolean
  needsReprocessing: boolean
}

// In-memory queue - key: entityId, value: queue state
const processingQueue = new Map<string, QueueItem>()

/**
 * Add entity to processing queue or mark for reprocessing
 * 
 * @param entityId - The entity ID to queue
 * @returns Boolean indicating if processing should start (true) or skip (false)
 */
export function enqueueWebhook(entityId: string): boolean {
  const now = Date.now()
  const existing = processingQueue.get(entityId)

  if (!existing) {
    // New entity - add to queue and start processing
    processingQueue.set(entityId, {
      entityId,
      timestamp: now,
      processing: true,
      needsReprocessing: false
    })
    
    logger.debug('Entity added to queue - starting processing', { entityId })
    return true
  }

  if (existing.processing) {
    // Already processing - mark for reprocessing
    existing.needsReprocessing = true
    existing.timestamp = now
    
    logger.debug('Entity already processing - marked for reprocessing', { 
      entityId,
      timestamp: now
    })
    return false
  }

  // In queue but not processing (shouldn't happen with current logic)
  logger.warn('Entity in queue but not processing - unexpected state', { entityId })
  return false
}

/**
 * Mark entity processing as complete and check if reprocessing needed
 * 
 * @param entityId - The entity ID that finished processing
 * @returns Boolean indicating if reprocessing is needed
 */
export function completeWebhookProcessing(entityId: string): boolean {
  const item = processingQueue.get(entityId)
  
  if (!item) {
    logger.warn('Attempted to complete processing for non-queued entity', { entityId })
    return false
  }

  if (item.needsReprocessing) {
    // Reset flags for reprocessing
    item.processing = true
    item.needsReprocessing = false
    
    logger.info('Entity needs reprocessing - webhook arrived during processing', {
      entityId,
      lastUpdate: item.timestamp
    })
    return true
  }

  // All done - remove from queue
  processingQueue.delete(entityId)
  logger.debug('Entity processing completed - removed from queue', { entityId })
  return false
}

/**
 * Get queue statistics for monitoring
 * 
 * @returns Queue stats
 */
export function getQueueStats(): {
  totalQueued: number
  processing: number
  needsReprocessing: number
} {
  const stats = {
    totalQueued: processingQueue.size,
    processing: 0,
    needsReprocessing: 0
  }

  for (const item of processingQueue.values()) {
    if (item.processing) {
      stats.processing++
    }
    if (item.needsReprocessing) {
      stats.needsReprocessing++
    }
  }

  return stats
}

/**
 * Clear stale queue items (items stuck processing for > 5 minutes)
 * Should be called periodically
 */
export function cleanStaleQueueItems(): number {
  const now = Date.now()
  const staleThreshold = 5 * 60 * 1000 // 5 minutes
  let cleaned = 0

  for (const [entityId, item] of processingQueue.entries()) {
    if (item.processing && now - item.timestamp > staleThreshold) {
      processingQueue.delete(entityId)
      cleaned++
      
      logger.warn('Removed stale queue item', {
        entityId,
        age: now - item.timestamp,
        threshold: staleThreshold
      })
    }
  }

  if (cleaned > 0) {
    logger.info('Cleaned stale queue items', { count: cleaned })
  }

  return cleaned
}
