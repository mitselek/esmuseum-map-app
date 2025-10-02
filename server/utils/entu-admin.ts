/**
 * F020: Server-side Entu Admin API utilities
 * 
 * Privileged operations for managing student access permissions
 * Uses NUXT_ENTU_ADMIN_KEY with elevated permissions
 */

import { createLogger } from './logger'
import { callEntuApi, searchEntuEntities, getEntuApiConfig, type EntuApiOptions } from './entu'

const logger = createLogger('entu-admin')

/**
 * Get admin API configuration using privileged key
 */
export function getAdminApiConfig(): EntuApiOptions {
  const config = useRuntimeConfig()
  const adminKey = config.entuAdminKey as string

  if (!adminKey) {
    logger.error('NUXT_ENTU_ADMIN_KEY not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin API key not configured'
    })
  }

  return getEntuApiConfig(adminKey)
}

/**
 * Grant _expander permission to a person on an entity
 * 
 * This allows the person to create child entities (e.g., vastus responses)
 * under the target entity (e.g., ulesanne task)
 * 
 * @param entityId - The entity to grant permission on (e.g., task ID)
 * @param personId - The person to grant permission to (e.g., student ID)
 * @returns API response from Entu
 */
export async function addExpanderPermission(entityId: string, personId: string) {
  const apiConfig = getAdminApiConfig()

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
  } catch (error) {
    logger.error('Failed to grant permission', {
      entity: entityId,
      person: personId,
      error
    })
    throw error
  }
}

/**
 * Get all tasks (ulesanne) assigned to a specific group (grupp)
 * 
 * @param gruppId - The group ID to search for
 * @returns Array of task entities
 */
export async function getTasksByGroup(gruppId: string) {
  const apiConfig = getAdminApiConfig()

  logger.debug('Fetching tasks for group', { gruppId })

  try {
    const result = await searchEntuEntities(
      {
        '_type.string': 'ulesanne',
        'grupp.reference': gruppId,
        'props': '_id,name.string,grupp.reference'
      },
      apiConfig
    )

    const tasks = result.entities || []
    
    logger.info('Found tasks for group', {
      gruppId,
      count: tasks.length,
      taskIds: tasks.map((t: any) => t._id)
    })

    return tasks
  } catch (error) {
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
export async function getStudentsByGroup(gruppId: string) {
  const apiConfig = getAdminApiConfig()

  logger.debug('Fetching students for group', { gruppId })

  try {
    const result = await searchEntuEntities(
      {
        '_type.string': 'person',
        '_parent.reference': gruppId,
        'props': '_id,name.string,forename.string,surname.string'
      },
      apiConfig
    )

    const students = result.entities || []
    
    logger.info('Found students in group', {
      gruppId,
      count: students.length,
      studentIds: students.map((s: any) => s._id)
    })

    return students
  } catch (error) {
    logger.error('Failed to fetch students by group', { gruppId, error })
    throw error
  }
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
export async function hasExpanderPermission(entityId: string, personId: string): Promise<boolean> {
  const apiConfig = getAdminApiConfig()

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
    const hasPermission = expanders.some((exp: any) => exp.reference === personId)

    logger.debug('Permission check result', {
      entity: entityId,
      person: personId,
      hasPermission
    })

    return hasPermission
  } catch (error) {
    logger.warn('Failed to check permission, assuming not exists', {
      entity: entityId,
      person: personId,
      error
    })
    // If we can't check, assume permission doesn't exist (safe default)
    return false
  }
}

/**
 * Batch grant permissions with error handling
 * 
 * Grants _expander permissions to multiple persons on multiple entities
 * Returns detailed results including successes and failures
 * 
 * @param entityIds - Array of entity IDs (e.g., task IDs)
 * @param personIds - Array of person IDs (e.g., student IDs)
 * @returns Summary of grant operations
 */
export async function batchGrantPermissions(
  entityIds: string[],
  personIds: string[]
): Promise<{
  total: number
  successful: number
  failed: number
  skipped: number
  details: Array<{ entity: string; person: string; status: 'success' | 'failed' | 'skipped'; error?: string }>
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
    details: [] as Array<{ entity: string; person: string; status: 'success' | 'failed' | 'skipped'; error?: string }>
  }

  // Process each entity-person combination
  for (const entityId of entityIds) {
    for (const personId of personIds) {
      results.total++

      try {
        // Check if permission already exists (idempotency)
        const exists = await hasExpanderPermission(entityId, personId)
        
        if (exists) {
          logger.debug('Permission already exists, skipping', { entity: entityId, person: personId })
          results.skipped++
          results.details.push({
            entity: entityId,
            person: personId,
            status: 'skipped'
          })
          continue
        }

        // Grant permission
        await addExpanderPermission(entityId, personId)
        results.successful++
        results.details.push({
          entity: entityId,
          person: personId,
          status: 'success'
        })
      } catch (error: any) {
        logger.error('Failed to grant permission in batch', {
          entity: entityId,
          person: personId,
          error: error.message
        })
        results.failed++
        results.details.push({
          entity: entityId,
          person: personId,
          status: 'failed',
          error: error.message || 'Unknown error'
        })
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
