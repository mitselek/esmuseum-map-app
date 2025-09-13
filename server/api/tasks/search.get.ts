/**
 * GET /api/tasks/search
 * Search tasks with query parameters
 * Compatible with current client-side searchEntities implementation
 */

import { withAuth, extractBearerToken } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { searchEntuEntities, getEntuApiConfig } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('tasks-search')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    try {
      const apiConfig = getEntuApiConfig(extractBearerToken(event))
      const query = getQuery(event)

      // Convert query parameters to search format
      const searchQuery: Record<string, any> = {}

      // Copy all query parameters for the search
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          searchQuery[key] = value
        }
      }

      // If no limit specified, add default limit like client does
      if (!searchQuery.limit) {
        searchQuery.limit = 1000
      }

      // Perform the search
      const searchResult = await searchEntuEntities(searchQuery, apiConfig)

      // Return in the exact same format as client searchEntities call
      return searchResult
    }
    catch (error: any) {
      logger.error('Task search failed', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to search tasks'
      })
    }
  })
})
