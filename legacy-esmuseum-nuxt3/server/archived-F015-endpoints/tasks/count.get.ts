/**
 * GET /api/tasks/[taskId]/responses/count
 * Get the total count of actual responses for a specific task
 */

import type { H3Event } from 'h3'
import type { AuthenticatedUser } from '../../utils/auth'
import { withAuth } from '../../utils/auth'
import { getEntuApiConfig, searchEntuEntities } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('task-responses-count')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: H3Event, _user: AuthenticatedUser) => {
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

      // Search for all responses to this task
      const responsesResult = await searchEntuEntities(
        {
          '_type.string': 'vastus',
          '_parent._id': taskId,
          limit: 1000 // Set a high limit to get all responses
        },
        apiConfig
      )

      const actualCount = responsesResult.entities?.length || 0

      return {
        success: true,
        taskId,
        responseCount: actualCount,
        message: `Found ${actualCount} actual responses for task ${taskId}`
      }
    }
    catch (error: unknown) {
      logger.error('Error getting task response count:', error)

      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusError = error as {
          statusCode: number
          statusMessage?: string
        }
        if (statusError.statusCode) {
          throw createError({
            statusCode: statusError.statusCode,
            statusMessage:
              statusError.statusMessage || 'Error getting task response count'
          })
        }
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error getting task response count'
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

  return authHeader.substring(7)
}
