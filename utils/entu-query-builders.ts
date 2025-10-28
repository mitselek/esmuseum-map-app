import { ENTU_TYPES, ENTU_PROPERTIES } from '../app/constants/entu'
import type { EntitySearchQuery } from '../app/composables/useEntuApi'

/**
 * Type-safe query builder for responses by task
 * 
 * Enforces the correct relationship: responses link to tasks via
 * the 'ulesanne' reference property, not '_parent'.
 * 
 * @param taskId - Task entity ID
 * @param userId - Optional user ID to filter by owner
 * @param limit - Optional result limit
 * @returns Query object for searchEntities
 * 
 * @example
 * ```typescript
 * const query = buildResponsesByTaskQuery(taskId, userId)
 * const results = await searchEntities(query)
 * ```
 */
export function buildResponsesByTaskQuery(
  taskId: string,
  userId?: string,
  limit?: number
): EntitySearchQuery {
  const query: EntitySearchQuery = {
    [ENTU_PROPERTIES.TYPE_STRING]: ENTU_TYPES.VASTUS,
    'ulesanne.reference': taskId // ✅ Correct: task as reference property
  }

  if (userId) {
    query['_owner.reference'] = userId
  }

  if (limit !== undefined) {
    query.limit = limit
  }

  return query
}

/**
 * Type-safe query builder for responses by user
 * 
 * @param userId - User entity ID
 * @param limit - Optional result limit
 * @returns Query object for searchEntities
 */
export function buildResponsesByUserQuery(
  userId: string,
  limit?: number
): EntitySearchQuery {
  const query: EntitySearchQuery = {
    [ENTU_PROPERTIES.TYPE_STRING]: ENTU_TYPES.VASTUS,
    '_owner.reference': userId
  }

  if (limit !== undefined) {
    query.limit = limit
  }

  return query
}

/**
 * Type-safe query builder for locations by map
 * 
 * @param mapId - Map entity ID
 * @param limit - Optional result limit
 * @returns Query object for searchEntities
 */
export function buildLocationsByMapQuery(
  mapId: string,
  limit?: number
): EntitySearchQuery {
  const query: EntitySearchQuery = {
    [ENTU_PROPERTIES.TYPE_STRING]: ENTU_TYPES.LOCATION,
    '_parent.reference': mapId // ✅ Correct: locations are children of maps
  }

  if (limit !== undefined) {
    query.limit = limit
  }

  return query
}

/**
 * Count responses for a task (client-side)
 * 
 * Use this as a workaround until Entu's vastuseid computed field
 * is updated to use 'ulesanne.reference' instead of '_parent.reference'.
 * 
 * @param taskId - Task entity ID
 * @param searchEntities - The searchEntities function from useEntuApi()
 * @returns Promise resolving to response count
 * 
 * @example
 * ```typescript
 * const { searchEntities } = useEntuApi()
 * const count = await countResponsesForTask(taskId, searchEntities)
 * ```
 */
export async function countResponsesForTask(
  taskId: string,
  searchEntities: (query: EntitySearchQuery) => Promise<{ count?: number, entities?: any[] }>
): Promise<number> {
  try {
    const query = buildResponsesByTaskQuery(taskId, undefined, 0)
    const result = await searchEntities(query)
    return result.count || result.entities?.length || 0
  }
  catch (error) {
    console.error('Failed to count responses for task:', taskId, error)
    return 0
  }
}

/**
 * Check if a user has submitted a response for a task
 * 
 * @param taskId - Task entity ID
 * @param userId - User entity ID
 * @param searchEntities - The searchEntities function from useEntuApi()
 * @returns Promise resolving to boolean
 */
export async function hasUserRespondedToTask(
  taskId: string,
  userId: string,
  searchEntities: (query: EntitySearchQuery) => Promise<{ count?: number, entities?: any[] }>
): Promise<boolean> {
  try {
    const query = buildResponsesByTaskQuery(taskId, userId, 1)
    const result = await searchEntities(query)
    return (result.entities?.length || 0) > 0
  }
  catch (error) {
    console.error('Failed to check user response:', error)
    return false
  }
}
