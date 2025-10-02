/**
 * F020: Student Added to Class Webhook
 * 
 * Entu calls this endpoint when a person entity is edited
 * Checks if person has _parent → grupp references and grants _expander
 * permission on all tasks assigned to those groups
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
  extractGroupsFromPerson,
  getTasksByGroup, 
  batchGrantPermissions 
} from '../../utils/entu-admin'

const logger = createLogger('webhook:student-added')

/**
 * Process the webhook - separated for reprocessing logic
 */
async function processStudentWebhook(entityId: string, userToken?: string, userId?: string, userEmail?: string) {
    logger.info('Processing student webhook', { entityId })  // Fetch full entity details
  const entity = await getEntityDetails(entityId, userToken, userId, userEmail)

  // Extract groups from person's _parent references
  const groupIds = extractGroupsFromPerson(entity)

  if (groupIds.length === 0) {
    logger.info('Person has no group memberships', { entityId })
    return {
      success: true,
      message: 'Person has no groups assigned',
      person_id: entityId,
      groups_found: 0,
      tasks_found: 0,
      permissions_granted: 0
    }
  }

  logger.info('Found groups for person', {
    personId: entityId,
    groupCount: groupIds.length,
    groupIds
  })

  // Get all tasks for all groups
  let allTasks: any[] = []
  for (const groupId of groupIds) {
    const tasks = await getTasksByGroup(groupId, userToken, userId, userEmail)
    allTasks = allTasks.concat(tasks)
  }

  // Remove duplicate tasks (if person belongs to multiple groups with same tasks)
  const uniqueTasks = Array.from(
    new Map(allTasks.map(task => [task._id, task])).values()
  )

  if (uniqueTasks.length === 0) {
    logger.info('No tasks found for person\'s groups', { entityId, groupIds })
    return {
      success: true,
      message: 'Person added to groups, but no tasks assigned yet',
      person_id: entityId,
      groups_found: groupIds.length,
      tasks_found: 0,
      permissions_granted: 0
    }
  }

  const taskIds = uniqueTasks.map(task => task._id)

  logger.info('Found tasks for person\'s groups', {
    personId: entityId,
    taskCount: uniqueTasks.length,
    taskIds
  })

  // Grant permissions to person for all tasks
  const results = await batchGrantPermissions(taskIds, [entityId], userToken, userId, userEmail)

  logger.info('Student access granted', {
    student: entityId,
    groups: groupIds.length,
    tasks: uniqueTasks.length,
    granted: results.successful,
    skipped: results.skipped,
    failed: results.failed
  })

  return {
    success: true,
    message: 'Student access granted successfully',
    person_id: entityId,
    groups_found: groupIds.length,
    tasks_found: uniqueTasks.length,
    permissions_granted: results.successful,
    permissions_skipped: results.skipped,
    permissions_failed: results.failed
  }
}

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

    // Process the student webhook

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
      result = await processStudentWebhook(entityId, userToken || undefined, userId || undefined, userEmail || undefined)
      
      // Check if reprocessing needed (entity was edited during processing)
      needsReprocessing = completeWebhookProcessing(entityId)
      
      if (needsReprocessing) {
        logger.info('Reprocessing entity - was edited during processing', { entityId })
        // Wait 2 seconds before reprocessing to let edits settle
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // 7. Return success response
    return {
      ...result,
      duration_ms: Date.now() - startTime
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
