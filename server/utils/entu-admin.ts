/**
 * F020: Server-side Entu API utilities
 *
 * Operations for managing student access permissions using user JWT tokens from webhooks
 */

import type { EntuEntity } from '../../types/entu'
import { createLogger } from './logger'
import { callEntuApi, searchEntuEntities, getEntuApiConfig, type EntuApiOptions } from './entu'

const logger = createLogger('entu-admin')

/**
 * Get API configuration for making Entu API calls
 *
 * @param userToken - JWT token from webhook (REQUIRED - no fallback)
 * @param userId - User ID for logging attribution
 * @param userEmail - User email for logging attribution
 * @returns API configuration with user authentication
 */
export async function getAdminApiConfig (
  userToken?: string,
  userId?: string,
  userEmail?: string
): Promise<EntuApiOptions> {
  const config = useRuntimeConfig()
  // Use public config for consistency with client-side code
  const apiUrl = config.public.entuUrl as string || 'https://entu.app'
  const accountName = config.public.entuAccount as string || 'esmuuseum'

  if (!apiUrl || !accountName) {
    logger.error('Entu API URL or account name not configured', { apiUrl, accountName })
    throw createError({
      statusCode: 500,
      statusMessage: 'Entu API configuration missing'
    })
  }

  // User JWT token is REQUIRED - no fallback to admin key
  if (!userToken) {
    logger.error('No user token provided - webhook must include JWT token', {
      userId,
      userEmail,
      note: 'User token is required for proper attribution and security'
    })
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing user authentication token from webhook'
    })
  }

  return {
    apiUrl,
    accountName,
    token: userToken
  }
}

/**
 * Grant _expander permission to a person on an entity
 *
 * This allows the person to create child entities (e.g., vastus responses)
 * under the target entity (e.g., ulesanne task)
 *
 * @param entityId - The entity to grant permission on (e.g., task ID)
 * @param personId - The person to grant permission to (e.g., student ID)
 * @param userToken - Optional JWT token from webhook user (not usable due to IP restrictions)
 * @param userId - Optional user ID for attribution logging
 * @param userEmail - Optional user email for attribution logging
 * @returns API response from Entu
 */
export async function addExpanderPermission (
  entityId: string,
  personId: string,
  userToken?: string,
  userId?: string,
  userEmail?: string
) {
  const apiConfig = await getAdminApiConfig(userToken, userId, userEmail)

  logger.info('Granting _expander permission', {
    entity: entityId,
    person: personId
  })

  try {
    // Entu requires properties as array of objects
    const properties = [
      {
        type: '_expander',
        reference: personId
      }
    ]

    const result = await callEntuApi(
      `/entity/${entityId}`,
      {
        method: 'POST',
        body: JSON.stringify(properties)
      },
      apiConfig
    )

    logger.info('Permission granted successfully', {
      entity: entityId,
      person: personId
    })

    return result
  }
  catch (error) {
    logger.error('Failed to grant permission', {
      entity: entityId,
      person: personId,
      error
    })
    throw error
  }
}

/**
 * Grant _viewer permission on an entity
 * Allows the person to read entity properties (read-only access)
 * Used to give students read access to their group entity so they can fetch group leader ID
 *
 * @param entityId - The entity to grant permission on (e.g., group ID)
 * @param personId - The person to grant permission to (e.g., student ID)
 * @param userToken - Optional JWT token from webhook user
 * @param userId - Optional user ID for attribution logging
 * @param userEmail - Optional user email for attribution logging
 * @returns API response from Entu
 */
export async function addViewerPermission (
  entityId: string,
  personId: string,
  userToken?: string,
  userId?: string,
  userEmail?: string
) {
  const apiConfig = await getAdminApiConfig(userToken, userId, userEmail)

  logger.info('Granting _viewer permission', {
    entity: entityId,
    person: personId
  })

  try {
    // Entu requires properties as array of objects
    const properties = [
      {
        type: '_viewer',
        reference: personId
      }
    ]

    const result = await callEntuApi(
      `/entity/${entityId}`,
      {
        method: 'POST',
        body: JSON.stringify(properties)
      },
      apiConfig
    )

    logger.info('Viewer permission granted successfully', {
      entity: entityId,
      person: personId
    })

    return result
  }
  catch (error) {
    logger.error('Failed to grant viewer permission', {
      entity: entityId,
      person: personId,
      error
    })
    throw error
  }
}

/**
 * Grant _expander permissions to multiple people on an entity in a single API call
 * Much more efficient than calling addExpanderPermission multiple times
 * Reduces API calls and webhook triggers (1 call instead of N calls)
 *
 * @param entityId - The entity to grant permissions on (e.g., task ID)
 * @param personIds - Array of person IDs to grant permission to
 * @param userToken - Optional JWT token from webhook user (not usable due to IP restrictions)
 * @param userId - Optional user ID for attribution logging
 * @param userEmail - Optional user email for attribution logging
 * @returns API response from Entu
 */
export async function addMultipleExpanderPermissions (
  entityId: string,
  personIds: string[],
  userToken?: string,
  userId?: string,
  userEmail?: string
) {
  const apiConfig = await getAdminApiConfig(userToken, userId, userEmail)

  logger.info('Granting multiple _expander permissions in single call', {
    entity: entityId,
    personCount: personIds.length,
    persons: personIds
  })

  try {
    // Build array of permission objects - one for each person
    const properties = personIds.map((personId) => ({
      type: '_expander',
      reference: personId
    }))

    const result = await callEntuApi(
      `/entity/${entityId}`,
      {
        method: 'POST',
        body: JSON.stringify(properties)
      },
      apiConfig
    )

    logger.info('Multiple permissions granted successfully', {
      entity: entityId,
      personCount: personIds.length
    })

    return result
  }
  catch (error) {
    logger.error('Failed to grant multiple permissions', {
      entity: entityId,
      personCount: personIds.length,
      error
    })
    throw error
  }
}

/**
 * Batch grant _expander permissions to multiple people on multiple entities
 * Optimized to use bulk permission grants per entity (1 API call per entity)
 * Includes idempotency check to skip persons who already have permission
 *
 * @param entityIds - Array of entity IDs (e.g., task IDs)
 * @param personIds - Array of person IDs (e.g., student IDs)
 * @param userToken - Optional JWT token from webhook user (not usable due to IP restrictions)
 * @param userId - Optional user ID for attribution logging
 * @param userEmail - Optional user email for attribution logging
 * @returns Summary of grant operations
 */
export async function batchGrantPermissions (
  entityIds: string[],
  personIds: string[],
  userToken?: string,
  userId?: string,
  userEmail?: string
): Promise<{
  total: number
  successful: number
  failed: number
  skipped: number
  details: Array<{ entity: string, person: string, status: 'success' | 'failed' | 'skipped', error?: string }>
}> {
  logger.info('Starting batch permission grant', {
    entities: entityIds.length,
    persons: personIds.length,
    total: entityIds.length * personIds.length
  })

  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    details: [] as Array<{ entity: string, person: string, status: 'success' | 'failed' | 'skipped', error?: string }>
  }

  // Process each entity
  for (const entityId of entityIds) {
    // Check which persons already have permission (idempotency)
    const personsToGrant: string[] = []

    for (const personId of personIds) {
      results.total++

      try {
        const exists = await hasExpanderPermission(entityId, personId, userToken, userId, userEmail)

        if (exists) {
          logger.debug('Permission already exists, skipping', { entity: entityId, person: personId })
          results.skipped++
          results.details.push({
            entity: entityId,
            person: personId,
            status: 'skipped'
          })
        }
        else {
          personsToGrant.push(personId)
        }
      }
      // Constitutional: Error type is unknown - we catch and validate errors at boundaries
      // Principle I: Type Safety First - documented exception for error handling
      catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error('Failed to check existing permission', {
          entity: entityId,
          person: personId,
          error: errorMessage
        })
        // Assume doesn't exist and try to grant
        personsToGrant.push(personId)
      }
    }

    // Grant all permissions for this entity in a single API call
    if (personsToGrant.length > 0) {
      try {
        await addMultipleExpanderPermissions(entityId, personsToGrant, userToken, userId, userEmail)

        // Mark all as successful
        for (const personId of personsToGrant) {
          results.successful++
          results.details.push({
            entity: entityId,
            person: personId,
            status: 'success'
          })
        }
      }
      // Constitutional: Error type is unknown - we catch and validate errors at boundaries
      // Principle I: Type Safety First - documented exception for error handling
      catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error('Failed to grant permissions in bulk', {
          entity: entityId,
          personCount: personsToGrant.length,
          error: errorMessage
        })

        // Mark all as failed
        for (const personId of personsToGrant) {
          results.failed++
          results.details.push({
            entity: entityId,
            person: personId,
            status: 'failed',
            error: errorMessage
          })
        }
      }
    }
  }

  logger.info('Batch permission grant completed', {
    total: results.total,
    successful: results.successful,
    failed: results.failed,
    skipped: results.skipped
  })

  return results
}

/**
 * Get all tasks (ulesanne) assigned to a specific group (grupp)
 *
 * @param gruppId - The group ID to search for
 * @returns Array of task entities
 */
export async function getTasksByGroup (gruppId: string, userToken?: string, userId?: string, userEmail?: string) {
  const apiConfig = await getAdminApiConfig(userToken, userId, userEmail)

  logger.debug('Fetching tasks for group', { gruppId })

  try {
    const result = await searchEntuEntities(
      {
        '_type.string': 'ulesanne',
        'grupp.reference': gruppId,
        props: '_id,name.string,grupp.reference'
      },
      apiConfig
    )

    const tasks = result.entities || []

    logger.info('Found tasks for group', {
      gruppId,
      count: tasks.length,
      taskIds: tasks.map((t: EntuEntity) => t._id)
    })

    return tasks
  }
  catch (error) {
    logger.error('Failed to fetch tasks by group', { gruppId, error })
    throw error
  }
}

/**
 * Get all students (person) that belong to a specific group (grupp)
 *
 * Students are linked to groups via _parent property
 *
 * @param gruppId - The group ID to search for
 * @returns Array of person entities
 */
export async function getStudentsByGroup (gruppId: string, userToken?: string, userId?: string, userEmail?: string) {
  const apiConfig = await getAdminApiConfig(userToken, userId, userEmail)

  logger.debug('Fetching students for group', { gruppId })

  try {
    const result = await searchEntuEntities(
      {
        '_type.string': 'person',
        '_parent.reference': gruppId,
        props: '_id,name.string,forename.string,surname.string'
      },
      apiConfig
    )

    const students = result.entities || []

    logger.info('Found students in group', {
      gruppId,
      count: students.length,
      studentIds: students.map((s: EntuEntity) => s._id)
    })

    return students
  }
  catch (error) {
    logger.error('Failed to fetch students by group', { gruppId, error })
    throw error
  }
}

/**
 * Fetch entity details from Entu
 * Used by webhooks to determine what changed and what actions to take
 *
 * @param entityId - The entity ID to fetch
 * @returns Full entity object
 */
export async function getEntityDetails (entityId: string, userToken?: string, userId?: string, userEmail?: string): Promise<any> {
  const apiConfig = await getAdminApiConfig(userToken, userId, userEmail)

  logger.debug('Fetching entity details', { entityId })

  try {
    const result = await callEntuApi(`/entity/${entityId}`, {}, apiConfig)

    // Entu API wraps entity in { entity: {...} }
    const entity = result.entity || result

    if (!entity) {
      throw new Error('Entity not found')
    }

    logger.debug('Entity details fetched', {
      entityId,
      type: entity._type?.[0]?.string,
      hasEntity: !!result.entity
    })

    return entity
  }
  // Constitutional: Error type is unknown - we catch and validate errors at boundaries
  // Principle I: Type Safety First - documented exception for error handling
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to fetch entity details', {
      entityId,
      error: errorMessage
    })
    throw error
  }
}

/**
 * Extract all group IDs from a person's _parent references
 * Only returns groups of type 'grupp'
 *
 * @param entity - Person entity object
 * @returns Array of group IDs
 */
export function extractGroupsFromPerson (entity: EntuEntity): string[] {
  // Verify entity is a person
  const entityType = entity._type?.[0]?.string
  if (entityType !== 'person') {
    logger.debug('Entity is not a person', { entityId: entity._id, entityType })
    return []
  }

  // Get _parent references
  const parents = entity._parent || []
  if (!Array.isArray(parents) || parents.length === 0) {
    logger.debug('Person has no parent references', { entityId: entity._id })
    return []
  }

  // Extract group IDs (grupp entity type)
  const groupIds: string[] = []
  for (const parent of parents) {
    // Check entity_type (not reference_type!) to identify grupp entities
    if (parent.entity_type === 'grupp' && parent.reference) {
      groupIds.push(parent.reference)
    }
  }

  logger.debug('Extracted groups from person', {
    personId: entity._id,
    groupCount: groupIds.length,
    groupIds
  })

  return groupIds
}

/**
 * Extract group ID from a task's grupp property
 * Returns the first group reference if multiple exist
 *
 * @param entity - Task (ulesanne) entity object
 * @returns Group ID or null if not found
 */
export function extractGroupFromTask (entity: EntuEntity): string | null {
  // Verify entity is a task
  const entityType = entity._type?.[0]?.string
  if (entityType !== 'ulesanne') {
    logger.debug('Entity is not a task', { entityId: entity._id, entityType })
    return null
  }

  // Constitutional: After verifying entity_type, we know this has grupp property
  // Principle I: Type Safety First - documented type narrowing at runtime check boundary
  const taskEntity = entity as EntuEntity & { grupp?: unknown }
  
  // Get grupp property
  const groups = taskEntity.grupp || []

  logger.debug('Checking task for group assignment', {
    taskId: entity._id,
    hasGruppProperty: !!taskEntity.grupp,
    gruppIsArray: Array.isArray(groups),
    gruppLength: Array.isArray(groups) ? groups.length : 0,
    firstGroup: Array.isArray(groups) && groups.length > 0 ? groups[0] : null
  })

  if (!Array.isArray(groups) || groups.length === 0) {
    logger.debug('Task has no group assignment', { entityId: entity._id })
    return null
  }

  // Return first group reference
  const group = groups[0]
  if (group.reference) {
    logger.debug('Extracted group from task', {
      taskId: entity._id,
      groupId: group.reference
    })
    return group.reference
  }

  logger.debug('Task group reference is invalid', {
    taskId: entity._id,
    group
  })
  return null
}

/**
 * Check if a person already has _expander permission on an entity
 *
 * This helps avoid duplicate permission grants and provides idempotency
 *
 * @param entityId - The entity to check
 * @param personId - The person to check for
 * @returns Boolean indicating if permission exists
 */
export async function hasExpanderPermission (entityId: string, personId: string, userToken?: string, userId?: string, userEmail?: string): Promise<boolean> {
  const apiConfig = await getAdminApiConfig(userToken, userId, userEmail)

  logger.debug('Checking existing permission', {
    entity: entityId,
    person: personId
  })

  try {
    // Get full entity data including permission arrays
    const result = await callEntuApi(`/entity/${entityId}`, {}, apiConfig)

    const entity = result.entity
    if (!entity) {
      return false
    }

    // Check _expander array for this person reference
    const expanders = entity._expander || []
    // Constitutional: Expander permission objects from Entu API have dynamic structure
    // We validate the properties we need (reference) at this boundary
    // Principle I: Type Safety First - documented exception for external API data
    const hasPermission = expanders.some((exp: unknown) =>
      typeof exp === 'object' &&
      exp !== null &&
      'reference' in exp &&
      exp.reference === personId
    )

    logger.debug('Permission check result', {
      entity: entityId,
      person: personId,
      hasPermission
    })

    return hasPermission
  }
  catch (error) {
    logger.warn('Failed to check permission, assuming not exists', {
      entity: entityId,
      person: personId,
      error
    })
    // If we can't check, assume permission doesn't exist (safe default)
    return false
  }
}
