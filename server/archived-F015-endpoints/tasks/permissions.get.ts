/**
 * GET /api/tasks/[taskId]/permissions
 * Check if current user has permission to respond to a task
 */

import { withAuth, checkTaskPermission } from '../../../utils/auth'
import type { AuthenticatedUser } from '../../../utils/auth'
import { getEntuApiConfig } from '../../../utils/entu'
import { createLogger } from '../../../utils/logger'

const logger = createLogger('task-permissions')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
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
    catch (error: any) {
      logger.error('Task permission check failed', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check task permissions'
      })
    }
  })
})

// Helper function to extract Bearer token (avoiding circular import)
function extractBearerToken (event: any): string {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authorization header'
    })
  }
  return authHeader.substring(7).trim()
}
