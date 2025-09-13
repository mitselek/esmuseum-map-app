/**
 * GET /api/locations/[mapId]
 * Get locations for a specific map
 * Replaces direct Entu API calls in useLocation composable
 */

import { withAuth, extractBearerToken } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { searchEntuEntities, getEntuApiConfig } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('locations-api')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    try {
      const apiConfig = getEntuApiConfig(extractBearerToken(event))
      const mapId = getRouterParam(event, 'mapId')

      if (!mapId || typeof mapId !== 'string') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Valid map ID is required'
        })
      }

      // Validate map ID format (MongoDB ObjectId)
      if (!/^[0-9a-fA-F]{24}$/.test(mapId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid map ID format'
        })
      }

      // Search for locations that belong to this map
      const searchResult = await searchEntuEntities({
        '_type.string': 'asukoht',
        '_parent.reference': mapId,
        'limit': 10000
      }, apiConfig)

      const locations = searchResult?.entities || []
      
      logger.info(`Loaded ${locations.length} locations for map ${mapId}`, {
        requestedLimit: 10000,
        actualCount: locations.length,
        searchResultCount: searchResult?.count
      })

      // Return in the same format as the client-side searchEntities call
      return {
        entities: locations,
        count: locations.length
      }
    }
    catch (error: any) {
      logger.error('Failed to load locations', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load locations'
      })
    }
  })
})
