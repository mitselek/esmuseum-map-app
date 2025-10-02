/**
 * F020: Server-side Entu Admin API utilities
 * 
 * Privileged operations for managing student access permissions
 * Uses NUXT_ENTU_ADMIN_KEY with elevated permissions
 */

import { createLogger } from './logger'
import { callEntuApi, searchEntuEntities, getEntuApiConfig, type EntuApiOptions } from './entu'

const logger = createLogger('entu-admin')

// Token cache - stores JWT tokens exchanged from API keys
let adminTokenCache: { token: string; expiresAt: number } | null = null

/**
 * Exchange API key for JWT token
 * Entu requires calling /auth endpoint with API key to get a JWT token
 */
async function exchangeApiKeyForToken(apiKey: string, apiUrl: string, accountName: string): Promise<string> {
  logger.debug('Exchanging API key for JWT token')

  try {
    const url = `${apiUrl}/api/auth?account=${accountName}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Accept-Encoding': 'deflate'
      }
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.error('Failed to exchange API key for token', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      })
      throw new Error(`Auth failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.token) {
      logger.error('Auth response missing token', { data })
      throw new Error('Auth response missing token')
    }

    logger.info('Successfully exchanged API key for JWT token')
    return data.token
  } catch (error: any) {
    logger.error('API key exchange failed', { error: error.message })
    throw error
  }
}

/**
 * Get admin API configuration using privileged key
 * Automatically exchanges API key for JWT token and caches it
 */
export async function getAdminApiConfig(): Promise<EntuApiOptions> {
  const config = useRuntimeConfig()
  const apiKey = config.entuAdminKey as string
  const apiUrl = config.entuApiUrl as string
  const accountName = config.entuClientId as string

  if (!apiKey) {
    logger.error('NUXT_ENTU_ADMIN_KEY not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin API key not configured'
    })
  }

  if (!apiUrl || !accountName) {
    logger.error('Entu API URL or account name not configured', { apiUrl, accountName })
    throw createError({
      statusCode: 500,
      statusMessage: 'Entu API configuration missing'
    })
  }

  // Check if we have a valid cached token
  const now = Date.now()
  if (adminTokenCache && adminTokenCache.expiresAt > now) {
    logger.debug('Using cached admin token')
    return getEntuApiConfig(adminTokenCache.token)
  }

  // Exchange API key for JWT token
  logger.debug('Admin token cache miss or expired - exchanging API key')
  const jwtToken = await exchangeApiKeyForToken(apiKey, apiUrl, accountName)

  // Cache the token for 23 hours (tokens typically valid for 24h)
  adminTokenCache = {
    token: jwtToken,
    expiresAt: now + (23 * 60 * 60 * 1000)
  }

  return getEntuApiConfig(jwtToken)
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
  const apiConfig = await getAdminApiConfig()

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
 * Grant _expander permissions to multiple people on an entity in a single API call
 * Much more efficient than calling addExpanderPermission multiple times
 * Reduces API calls and webhook triggers (1 call instead of N calls)
 * 
 * @param entityId - The entity to grant permissions on (e.g., task ID)
 * @param personIds - Array of person IDs to grant permission to
 * @returns API response from Entu
 */
export async function addMultipleExpanderPermissions(entityId: string, personIds: string[]) {
  const apiConfig = await getAdminApiConfig()

  logger.info('Granting multiple _expander permissions in single call', {
    entity: entityId,
    personCount: personIds.length,
    persons: personIds
  })

  try {
    // Build array of permission objects - one for each person
    const properties = personIds.map(personId => ({
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
  } catch (error) {
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
 * Uses bulk API calls per entity for maximum efficiency (1 API call per entity instead of 1 per person)
 * Checks for existing permissions (idempotency) before granting
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

  // Process each entity
  for (const entityId of entityIds) {
    // Check which persons already have permission (idempotency)
    const personsToGrant: string[] = []
    
    for (const personId of personIds) {
      results.total++
      
      try {
        const exists = await hasExpanderPermission(entityId, personId)
        
        if (exists) {
          logger.debug('Permission already exists, skipping', { entity: entityId, person: personId })
          results.skipped++
          results.details.push({
            entity: entityId,
            person: personId,
            status: 'skipped'
          })
        } else {
          personsToGrant.push(personId)
        }
      } catch (error: any) {
        logger.error('Failed to check existing permission', {
          entity: entityId,
          person: personId,
          error: error.message
        })
        // Assume doesn't exist and try to grant
        personsToGrant.push(personId)
      }
    }

    // Grant all permissions for this entity in a single API call
    if (personsToGrant.length > 0) {
      try {
        await addMultipleExpanderPermissions(entityId, personsToGrant)
        
        // Mark all as successful
        for (const personId of personsToGrant) {
          results.successful++
          results.details.push({
            entity: entityId,
            person: personId,
            status: 'success'
          })
        }
      } catch (error: any) {
        logger.error('Failed to grant permissions in bulk', {
          entity: entityId,
          personCount: personsToGrant.length,
          error: error.message
        })
        
        // Mark all as failed
        for (const personId of personsToGrant) {
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
export async function getTasksByGroup(gruppId: string) {
  const apiConfig = await getAdminApiConfig()

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
  const apiConfig = await getAdminApiConfig()

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
 * Fetch entity details from Entu
 * Used by webhooks to determine what changed and what actions to take
 * 
 * @param entityId - The entity ID to fetch
 * @returns Full entity object
 */
export async function getEntityDetails(entityId: string): Promise<any> {
  const apiConfig = await getAdminApiConfig()

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
  } catch (error: any) {
    logger.error('Failed to fetch entity details', {
      entityId,
      error: error.message
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
export function extractGroupsFromPerson(entity: any): string[] {
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
export function extractGroupFromTask(entity: any): string | null {
  // Verify entity is a task
  const entityType = entity._type?.[0]?.string
  if (entityType !== 'ulesanne') {
    logger.debug('Entity is not a task', { entityId: entity._id, entityType })
    return null
  }

  // Get grupp property
  const groups = entity.grupp || []
  
  logger.debug('Checking task for group assignment', {
    taskId: entity._id,
    hasGruppProperty: !!entity.grupp,
    gruppIsArray: Array.isArray(groups),
    gruppLength: groups.length,
    firstGroup: groups[0]
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
export async function hasExpanderPermission(entityId: string, personId: string): Promise<boolean> {
  const apiConfig = await getAdminApiConfig()

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
