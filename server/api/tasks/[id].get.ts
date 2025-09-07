/**
 * GET /api/tasks/[id]
 * Get task details with same format as client getEntity call
 * Compatible with current client-side implementation
 */

import { validateEntityId, createSuccessResponse } from '../../utils/validation'
import { withAuth, checkTaskPermission, extractBearerToken } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { getEntuEntity, getEntuApiConfig } from '../../utils/entu'

export default defineEventHandler(async (event) => {
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

      // Return in the exact same format as client getEntity call
      // Client expects: taskResponse.entity
      return {
        entity: taskResult
      }
    }
    catch (error: any) {
      console.error('Failed to get task data:', error)

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
