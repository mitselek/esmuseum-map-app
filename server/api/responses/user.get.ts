/**
 * GET /api/responses/user
 * Get user's responses, optionally filtered by task
 */

import { validateRequiredString, createSuccessResponse } from '../../utils/validation'
import { withAuth } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { searchEntuEntities, getEntuApiConfig } from '../../utils/entu'

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    // Get query parameters
    const query = getQuery(event)
    const taskId = query.taskId as string

    try {
      const apiConfig = getEntuApiConfig(extractBearerToken(event))

      // Build search query for user's responses
      const searchQuery: Record<string, any> = {
        '_type.string': 'vastus',
        'kasutaja._id': user._id,
        limit: 100,
        props: 'ulesanne,vastused,esitamisaeg,muutmisaeg,staatus'
      }

      // Filter by task if specified
      if (taskId) {
        validateRequiredString(taskId, 'taskId')
        searchQuery['ulesanne._id'] = taskId
      }

      // Search for user's responses
      const responsesResult = await searchEntuEntities(searchQuery, apiConfig)

      const responses = responsesResult.entities || []

      // If filtering by specific task, return single response or null
      if (taskId) {
        const response = responses.length > 0 ? responses[0] : null
        return createSuccessResponse({
          response,
          hasResponse: !!response,
          submittedAt: response?.esitamisaeg,
          lastModified: response?.muutmisaeg
        })
      }

      // Return all user responses
      return createSuccessResponse({
        responses: responses.map((response: any) => ({
          id: response._id,
          taskId: response.ulesanne?._id,
          taskTitle: response.ulesanne?.pealkiri || response.ulesanne?.nimi,
          responses: response.vastused || [],
          submittedAt: response.esitamisaeg,
          lastModified: response.muutmisaeg,
          status: response.staatus
        })),
        count: responses.length
      })
    }
    catch (error: any) {
      console.error('Failed to get user responses:', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get user responses'
      })
    }
  })
})

// Helper function to extract Bearer token
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
