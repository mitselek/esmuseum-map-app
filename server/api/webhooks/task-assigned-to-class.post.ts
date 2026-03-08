/**
 * F020: Task Assigned to Class Webhook
 *
 * Entu calls this endpoint when a task (ulesanne) entity is edited
 * Checks if task has grupp reference and grants _expander permission
 * to all students in that group
 */

import type { EntuEntity } from '../../../types/entu'
import { defineEventHandler, readBody } from 'h3'
import { createLogger } from '../../utils/logger'
import {
  validateWebhookRequest,
  validateWebhookPayload,
  extractEntityId,
  extractUserToken,
  checkRateLimit
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
 * Validate incoming webhook request and extract entity data.
 * Throws H3 errors for invalid requests.
 */
async function validateAndExtract (event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
  const rateLimitOk = checkRateLimit(event, 100, 60000)
  if (!rateLimitOk) {
    logger.warn('Rate limit exceeded')
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const isValidWebhook = validateWebhookRequest(event)
  if (!isValidWebhook) {
    logger.warn('Webhook validation failed')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized webhook request' })
  }

  const payload = await readBody(event)
  const payloadValidation = validateWebhookPayload(payload)
  if (!payloadValidation.valid) {
    logger.warn('Invalid webhook payload', { errors: payloadValidation.errors })
    throw createError({ statusCode: 400, statusMessage: `Invalid payload: ${payloadValidation.errors.join(', ')}` })
  }

  const entityId = extractEntityId(payload)
  if (!entityId) {
    logger.warn('Missing entity ID in payload')
    throw createError({ statusCode: 400, statusMessage: 'Missing entity ID in payload' })
  }

  const { token: userToken, userId, userEmail } = extractUserToken(payload)
  logger.info('Webhook initiated by user', { userId, userEmail })

  return { entityId, userToken, userId, userEmail }
}

/**
 * Extract error details from an unknown error value
 */
function getErrorInfo (err: unknown): { message: string, statusCode: number | undefined } {
  const message = err instanceof Error ? err.message : 'Unknown error'
  const statusCode = typeof err === 'object' && err !== null && 'statusCode' in err
    ? (err as { statusCode: number }).statusCode
    : undefined
  return { message, statusCode }
}

/**
 * Process the webhook - separated for reprocessing logic
 */
async function processTaskWebhook (entityId: string, userToken?: string, userId?: string, userEmail?: string) {
  logger.info('Processing task webhook', { entityId }) // Fetch full entity details
  const entity = await getEntityDetails(entityId, userToken, userId, userEmail)

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Task entity not found: ${entityId}`
    })
  }

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

  const studentIds = students.map((student: EntuEntity) => student._id)

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

/**
 * Process webhook with reprocessing loop for entities edited during processing
 */
async function processWithReprocessing (entityId: string, userToken: string | null, userId: string | null, userEmail: string | null) {
  let result
  let needsReprocessing = true

  while (needsReprocessing) {
    // eslint-disable-next-line no-await-in-loop -- while-loop debounce pattern, not collection iteration
    result = await processTaskWebhook(entityId, userToken || undefined, userId || undefined, userEmail || undefined)

    needsReprocessing = completeWebhookProcessing(entityId)

    if (needsReprocessing) {
      logger.info('Reprocessing entity - was edited during processing', { entityId })
      // eslint-disable-next-line no-await-in-loop -- while-loop debounce pattern, not collection iteration
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2000)
      })
    }
  }

  return result
}

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  logger.info('Webhook received: task-assigned-to-class')

  try {
    // 1-4. Validate request and extract entity data
    const { entityId, userToken, userId, userEmail } = await validateAndExtract(event)

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

    // 6. Process webhook with reprocessing loop
    const result = await processWithReprocessing(entityId, userToken, userId, userEmail)

    // 7. Return success response
    return {
      ...result,
      duration_ms: Date.now() - startTime
    }
  }
  // Constitutional: Error type is unknown - we catch and validate errors at boundaries
  // Principle I: Type Safety First - documented exception for error handling
  catch (err: unknown) {
    const duration = Date.now() - startTime
    const { message, statusCode } = getErrorInfo(err)

    logger.error('Webhook processing failed', { error: message, statusCode, duration })

    if (statusCode) {
      throw err
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error processing webhook'
    })
  }
})
