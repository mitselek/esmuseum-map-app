/**
 * GET /api/responses/[taskId]
 * Get user's response for a specific task
 */

import { withAuth } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { getEntuApiConfig, searchEntuEntities } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('responses-api')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    const taskId = getRouterParam(event, 'taskId')
    
    // Try alternative methods to get the task ID
    const alternativeTaskId = event.context?.params?.taskId 
      || event.context?.params?.id
      || event.node?.req?.params?.taskId
    
    const finalTaskId = taskId || alternativeTaskId
    
    if (!finalTaskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required'
      })
    }

    // Validate task ID format (should be MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(finalTaskId)) {
      logger.warn(`Invalid task ID format: ${finalTaskId}`)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid task ID format'
      })
    }

    try {
      // Get API config
      const apiConfig = getEntuApiConfig(extractBearerToken(event))

      // Search for user's response to this task
      const userResponse = await searchEntuEntities({
        '_type.string': 'vastus',
        '_parent._id': finalTaskId,
        '_owner._id': user._id,
        '_limit': 1
      }, apiConfig)

      const hasResponse = userResponse.entities && userResponse.entities.length > 0

      if (hasResponse) {
        return {
          success: true,
          response: userResponse.entities[0]
        }
      }

      return {
        success: true,
        response: null
      }
    }
    catch (error: any) {
      logger.error('Failed to fetch user response', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user response'
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
