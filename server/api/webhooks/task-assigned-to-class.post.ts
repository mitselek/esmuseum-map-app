/**
 * F020: Task Assigned to Class Webhook
 * 
 * Entu calls this endpoint when a task (ulesanne) is assigned to a class (grupp)
 * Automatically grants all class students _expander permission on the task
 */

import { defineEventHandler, readBody } from 'h3'
import { createLogger } from '../../utils/logger'
import { 
  validateWebhookRequest, 
  validateWebhookPayload, 
  extractEntityIds,
  checkRateLimit,
  sanitizePayloadForLogging 
} from '../../utils/webhook-validation'
import { 
  getStudentsByGroup, 
  batchGrantPermissions 
} from '../../utils/entu-admin'

const logger = createLogger('webhook:task-assigned')

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
    
    logger.debug('Webhook payload received', {
      payload: sanitizePayloadForLogging(payload)
    })

    const payloadValidation = validateWebhookPayload(payload)
    if (!payloadValidation.valid) {
      logger.warn('Invalid webhook payload', { errors: payloadValidation.errors })
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid payload: ${payloadValidation.errors.join(', ')}`
      })
    }

    // 4. Extract entity IDs
    const { entityId: taskId, referenceId: gruppId, entityType } = extractEntityIds(payload)

    if (!taskId || !gruppId) {
      logger.warn('Missing required IDs in payload', { taskId, gruppId })
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing task ID or group ID in payload'
      })
    }

    // Verify this is a grupp reference
    if (entityType && entityType !== 'grupp') {
      logger.warn('Wrong entity type - expected grupp', { entityType, taskId, gruppId })
      throw createError({
        statusCode: 400,
        statusMessage: `Expected grupp entity type, got: ${entityType}`
      })
    }

    logger.info('Processing task assigned to class', {
      taskId,
      gruppId
    })

    // 5. Get all students in this group
    const students = await getStudentsByGroup(gruppId)

    if (students.length === 0) {
      logger.info('No students found in group - nothing to grant', { gruppId })
      return {
        success: true,
        message: 'Task assigned to class, but no students in class yet',
        task_id: taskId,
        group_id: gruppId,
        students_found: 0,
        permissions_granted: 0
      }
    }

    const studentIds = students.map((student: any) => student._id)

    logger.info('Found students in group', {
      gruppId,
      studentCount: students.length,
      studentIds
    })

    // 6. Grant permissions to all students for this task
    const results = await batchGrantPermissions([taskId], studentIds)

    const duration = Date.now() - startTime

    logger.info('Task access management completed', {
      taskId,
      gruppId,
      duration,
      ...results
    })

    // 7. Return success response
    return {
      success: true,
      message: 'Task access granted to all students successfully',
      task_id: taskId,
      group_id: gruppId,
      students_found: students.length,
      permissions_granted: results.successful,
      permissions_skipped: results.skipped,
      permissions_failed: results.failed,
      duration_ms: duration
    }

  } catch (error: any) {
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
