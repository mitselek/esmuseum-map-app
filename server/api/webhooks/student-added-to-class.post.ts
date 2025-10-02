/**
 * F020: Student Added to Class Webhook
 * 
 * Entu calls this endpoint when a student (person) is added to a class (grupp)
 * Automatically grants the student _expander permission on all tasks assigned to that class
 */

import { defineEventHandler, readBody } from 'h3'
import { createLogger } from '~/server/utils/logger'
import { 
  validateWebhookRequest, 
  validateWebhookPayload, 
  extractEntityIds,
  checkRateLimit,
  sanitizePayloadForLogging 
} from '~/server/utils/webhook-validation'
import { 
  getTasksByGroup, 
  batchGrantPermissions 
} from '~/server/utils/entu-admin'

const logger = createLogger('webhook:student-added')

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  logger.info('Webhook received: student-added-to-class')

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
    const { entityId: studentId, referenceId: gruppId, entityType } = extractEntityIds(payload)

    if (!studentId || !gruppId) {
      logger.warn('Missing required IDs in payload', { studentId, gruppId })
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing student ID or group ID in payload'
      })
    }

    // Verify this is a grupp reference
    if (entityType && entityType !== 'grupp') {
      logger.warn('Wrong entity type - expected grupp', { entityType, studentId, gruppId })
      throw createError({
        statusCode: 400,
        statusMessage: `Expected grupp entity type, got: ${entityType}`
      })
    }

    logger.info('Processing student added to class', {
      studentId,
      gruppId
    })

    // 5. Get all tasks for this group
    const tasks = await getTasksByGroup(gruppId)

    if (tasks.length === 0) {
      logger.info('No tasks found for group - nothing to grant', { gruppId })
      return {
        success: true,
        message: 'Student added to class, but no tasks assigned yet',
        student_id: studentId,
        group_id: gruppId,
        tasks_found: 0,
        permissions_granted: 0
      }
    }

    const taskIds = tasks.map((task: any) => task._id)

    logger.info('Found tasks for group', {
      gruppId,
      taskCount: tasks.length,
      taskIds
    })

    // 6. Grant permissions to student for all tasks
    const results = await batchGrantPermissions(taskIds, [studentId])

    const duration = Date.now() - startTime

    logger.info('Student access management completed', {
      studentId,
      gruppId,
      duration,
      ...results
    })

    // 7. Return success response
    return {
      success: true,
      message: 'Student access granted successfully',
      student_id: studentId,
      group_id: gruppId,
      tasks_found: tasks.length,
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
