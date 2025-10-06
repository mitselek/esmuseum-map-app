/**
 * F020: Task Assigned to Class Webhook
 *
 * Entu calls this endpoint when a task (ulesanne) entity is edited
 * Checks if task has grupp reference and grants _expander permission
 * to all students in that group
 */

import { defineEventHandler, readBody } from 'h3'
import { createLogger } from '../../utils/logger'
import {
  validateWebhookRequest,
  validateWebhookPayload,
  extractEntityId,
  extractUserToken,
  checkRateLimit,
  sanitizePayloadForLogging
} from '../../utils/webhook-validation'
import {
  enqueueWebhook,
  completeWebhookProcessing
} from '../../utils/webhook-queue'
import {
  getEntityDetails,
  extractGroupFromTask,
  getStudentsByGroup,
  batchGrantPermissions
} from '../../utils/entu-admin'

const logger = createLogger('webhook:task-assigned')

/**
 * Process the webhook - separated for reprocessing logic
 */
async function processTaskWebhook (entityId: string, userToken?: string, userId?: string, userEmail?: string) {
  logger.info('Processing task webhook', { entityId }) // Fetch full entity details
  const entity = await getEntityDetails(entityId, userToken, userId, userEmail)

  // Extract group from task's grupp property
  const groupId = extractGroupFromTask(entity)

  if (!groupId) {
    logger.info('Task has no group assignment', { entityId })
    return {
      success: true,
      message: 'Task has no group assigned',
      task_id: entityId,
      group_found: false,
      students_found: 0,
      permissions_granted: 0
    }
  }

  logger.info('Found group for task', {
    taskId: entityId,
    groupId
  })

  // Get all students in the group
  const students = await getStudentsByGroup(groupId, userToken, userId, userEmail)

  if (students.length === 0) {
    logger.info('No students found in group', { groupId, taskId: entityId })
    return {
      success: true,
      message: 'Task assigned to group, but no students in group yet',
      task_id: entityId,
      group_id: groupId,
      group_found: true,
      students_found: 0,
      permissions_granted: 0
    }
  }

  const studentIds = students.map((student: any) => student._id)

  logger.info('Found students in group', {
    taskId: entityId,
    groupId,
    studentCount: students.length,
    studentIds
  })

  // Grant permissions to all students for this task
  const results = await batchGrantPermissions([entityId], studentIds, userToken, userId, userEmail)

  logger.info('Task access granted', {
    task: entityId,
    group: groupId,
    students: students.length,
    granted: results.successful,
    skipped: results.skipped,
    failed: results.failed
  })

  return {
    success: true,
    message: 'Task access granted to students successfully',
    task_id: entityId,
    group_id: groupId,
    group_found: true,
    students_found: students.length,
    permissions_granted: results.successful,
    permissions_skipped: results.skipped,
    permissions_failed: results.failed
  }
}

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  logger.info('Webhook received: task-assigned-to-class')

  try {
    // 1. Rate limiting
    const rateLimitOk = checkRateLimit(event, 100, 60000)
    if (!rateLimitOk) {
      logger.warn('Rate limit exceeded')
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }

    // 2. Validate webhook authenticity
    const isValidWebhook = validateWebhookRequest(event)
    if (!isValidWebhook) {
      logger.warn('Webhook validation failed')
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized webhook request'
      })
    }

    // 3. Read and validate payload
    const payload = await readBody(event)

    const payloadValidation = validateWebhookPayload(payload)
    if (!payloadValidation.valid) {
      logger.warn('Invalid webhook payload', { errors: payloadValidation.errors })
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid payload: ${payloadValidation.errors.join(', ')}`
      })
    }

    // 4. Extract entity ID and user token
    const entityId = extractEntityId(payload)
    const { token: userToken, userId, userEmail } = extractUserToken(payload)

    if (!entityId) {
      logger.warn('Missing entity ID in payload')
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing entity ID in payload'
      })
    }

    logger.info('Webhook initiated by user', { userId, userEmail })

    // 5. Check queue - debounce if already processing
    const shouldProcess = enqueueWebhook(entityId)

    if (!shouldProcess) {
      logger.info('Entity already queued - webhook will be reprocessed', { entityId })
      return {
        success: true,
        message: 'Webhook queued for reprocessing',
        entity_id: entityId,
        queued: true
      }
    }

    // 6. Process webhook
    let result
    let needsReprocessing = true

    while (needsReprocessing) {
      result = await processTaskWebhook(entityId, userToken || undefined, userId || undefined, userEmail || undefined)

      // Check if reprocessing needed (entity was edited during processing)
      needsReprocessing = completeWebhookProcessing(entityId)

      if (needsReprocessing) {
        logger.info('Reprocessing entity - was edited during processing', { entityId })
        // Wait 2 seconds before reprocessing to let edits settle
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    // 7. Return success response
    return {
      ...result,
      duration_ms: Date.now() - startTime
    }
  }
  catch (error: any) {
    const duration = Date.now() - startTime

    logger.error('Webhook processing failed', {
      error: error.message,
      statusCode: error.statusCode,
      duration
    })

    // Return appropriate error response
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error processing webhook'
    })
  }
})
