/**
 * GET /api/tasks/permissions
 * Check user permissions for task operations
 */

import type { H3Event } from 'h3'
import type { AuthenticatedUser } from '../../utils/auth'
import { checkTaskPermission, withAuth } from '../../utils/auth'
import { getEntuApiConfig } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('task-permissions')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: H3Event, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    const taskId = getRouterParam(event, 'taskId')

    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required'
      })
    }

    // Validate task ID format (should be MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      logger.warn(`Invalid task ID format: ${taskId}`)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid task ID format'
      })
    }

    try {
      // Get API config
      const apiConfig = getEntuApiConfig(extractBearerToken(event))

      // Check if user has permission to respond to this task
      const hasPermission = await checkTaskPermission(user, taskId, apiConfig)

      return {
        success: true,
        hasPermission,
        taskId,
        userId: user._id
      }
    }
    catch (error: unknown) {
      logger.error('Error checking task permissions:', error)

      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusError = error as {
          statusCode: number
          statusMessage?: string
        }
        if (statusError.statusCode) {
          throw createError({
            statusCode: statusError.statusCode,
            statusMessage:
              statusError.statusMessage || 'Error checking task permissions'
          })
        }
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error checking task permissions'
      })
    }
  })
})

// Helper function to extract Bearer token (avoiding circular import)
function extractBearerToken (event: H3Event): string {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing or invalid authorization header'
    })
  }

  return authHeader.substring(7) // Remove 'Bearer ' prefix
}
