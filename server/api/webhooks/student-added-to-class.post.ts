/**
 * F020: Student Added to Class Webhook
 *
 * Entu calls this endpoint when a person entity is edited
 * Checks if person has _parent → grupp references and grants _expander
 * permission on all tasks assigned to those groups
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
  extractGroupsFromPerson,
  getTasksByGroup,
  batchGrantPermissions,
  addViewerPermission
} from '../../utils/entu-admin'

const logger = createLogger('webhook:student-added')

/**
 * Process the webhook - separated for reprocessing logic
 */
async function processStudentWebhook (entityId: string, userToken?: string, userId?: string, userEmail?: string) {
  logger.info('Processing student webhook', { entityId }) // Fetch full entity details
  const entity = await getEntityDetails(entityId, userToken, userId, userEmail)

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Person entity not found: ${entityId}`
    })
  }

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

  // Add student as viewer of each group
  // This allows students to read group properties (e.g., group leader ID)
  for (const groupId of groupIds) {
    try {
      // eslint-disable-next-line no-await-in-loop -- sequential Entu API calls: no published rate limits, 60s token validity favors sequential
      await addViewerPermission(groupId, entityId, userToken, userId, userEmail)
      logger.info('Added student as viewer of group', { groupId, studentId: entityId })
    }
    catch (error) {
      // Log but continue - viewer permission is helpful but not critical
      logger.warn('Failed to add student as viewer of group', {
        groupId,
        studentId: entityId,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // Get all tasks for all groups
  let allTasks: EntuEntity[] = []
  for (const groupId of groupIds) {
    // eslint-disable-next-line no-await-in-loop -- sequential Entu API calls: no published rate limits, 60s token validity favors sequential
    const tasks = await getTasksByGroup(groupId, userToken, userId, userEmail)
    allTasks = allTasks.concat(tasks)
  }

  // Remove duplicate tasks (if person belongs to multiple groups with same tasks)
  const uniqueTasks = Array.from(
    new Map(allTasks.map((task) => [task._id, task])).values()
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

  const taskIds = uniqueTasks.map((task) => task._id)

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

/**
 * Validate webhook request: rate limit, auth, payload, entity ID
 */
async function validateAndExtractWebhookData (event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
  const rateLimitOk = checkRateLimit(event, 100, 60000)
  if (!rateLimitOk) {
    logger.warn('Rate limit exceeded')
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  if (!validateWebhookRequest(event)) {
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
  return { entityId, userToken: userToken || undefined, userId: userId || undefined, userEmail: userEmail || undefined }
}

/**
 * Process webhook with debounce-based reprocessing loop
 */
async function processWithReprocessing (entityId: string, userToken?: string, userId?: string, userEmail?: string) {
  let result
  let needsReprocessing = true

  while (needsReprocessing) {
    // eslint-disable-next-line no-await-in-loop -- while-loop debounce pattern, not collection iteration
    result = await processStudentWebhook(entityId, userToken, userId, userEmail)
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
  logger.info('Webhook received: student-added-to-class')

  try {
    const { entityId, userToken, userId, userEmail } = await validateAndExtractWebhookData(event)

    const shouldProcess = enqueueWebhook(entityId)
    if (!shouldProcess) {
      logger.info('Entity already queued - webhook will be reprocessed', { entityId })
      return { success: true, message: 'Webhook queued for reprocessing', entity_id: entityId, queued: true }
    }

    const result = await processWithReprocessing(entityId, userToken, userId, userEmail)
    return { ...result, duration_ms: Date.now() - startTime }
  }
  catch (error: unknown) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : undefined

    logger.error('Webhook processing failed', { error: errorMessage, statusCode, duration })

    if (statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error processing webhook' })
  }
})
