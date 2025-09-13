/**
 * GET /api/responses/[taskId]
 * Get user's response for a specific task
 */

import { withAuth } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { getEntuApiConfig, searchEntuEntities } from '../../utils/entu'

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    const taskId = getRouterParam(event, 'taskId')
    
    console.log('GET /api/responses/[taskId] - Task ID:', taskId)
    
    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required'
      })
    }

    try {
      // Get API config
      const apiConfig = getEntuApiConfig(extractBearerToken(event))

      // Search for user's response to this task
      const userResponse = await searchEntuEntities({
        '_type.string': 'vastus',
        '_parent._id': taskId,
        '_owner._id': user._id,
        limit: 1
      }, apiConfig)

      console.log('Found user response:', userResponse)

      if (userResponse.entities && userResponse.entities.length > 0) {
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
      console.error('Failed to fetch user response:', error)

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
