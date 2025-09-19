/**
 * GET /api/tasks/[id]
 * Get task details with same format as client getEntity call
 * Compatible with current client-side implementation
 */

import { validateEntityId, createSuccessResponse } from '../../utils/validation'
import { withAuth, checkTaskPermission, extractBearerToken } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { getEntuEntity, getEntuApiConfig } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const logger = createLogger('api:tasks:get')

  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    // Get and validate task ID from URL
    const taskId = validateEntityId(getRouterParam(event, 'id'))

    try {
      const apiConfig = getEntuApiConfig(extractBearerToken(event))

      // Check if user has permission to access this task (currently allows all authenticated users)
      const hasPermission = await checkTaskPermission(user, taskId, apiConfig)

      if (!hasPermission) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You do not have permission to access this task'
        })
      }

      // Get task details with all required properties including kaart (map) reference
      const taskResult = await getEntuEntity(taskId, apiConfig, 'name,grupp,kaart,kirjeldus')

      if (!taskResult) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Task not found'
        })
      }

      // Return the result directly since getEntuEntity already returns {entity: ...}
      // Client expects: taskResponse.entity
      return taskResult
    }
    catch (error: any) {
      logger.error('Failed to get task data', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get task data'
      })
    }
  })
})
