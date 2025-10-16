/**
 * Server Endpoint: GET /api/onboard/validate-user (BUG-023)
 *
 * Validates if a user entity exists in Entu
 * Used to detect stale authentication when user entity has been deleted
 *
 * @see https://github.com/mitselek/esmuseum-map-app/issues/23
 */

import { getEntuApiConfig, searchEntuEntities, exchangeApiKeyForToken } from '../../utils/entu'
import { createLogger } from '../../utils/logger'
import type { EntuPerson, EntuEntityListResponse } from '../../../types/entu'

const logger = createLogger('validate-user')

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    if (!query.userId || typeof query.userId !== 'string') {
      setResponseStatus(event, 400)
      return {
        exists: false,
        error: 'Missing userId parameter'
      }
    }

    const { userId } = query

    logger.info('[AUTH-VALIDATE] Checking user entity existence', { userId })

    // Exchange API key for JWT token
    const jwtToken = await exchangeApiKeyForToken(config.entuManagerKey as string)
    const apiConfig = getEntuApiConfig(jwtToken)

    // Search for the user entity by ID
    const searchResults = await searchEntuEntities({
      '_type.string': 'person',
      '_id': userId
    }, apiConfig) as EntuEntityListResponse<EntuPerson>

    const exists = searchResults.entities && searchResults.entities.length > 0

    if (exists) {
      logger.info('[AUTH-VALID] User entity confirmed', { userId })
    }
    else {
      logger.warn('[AUTH-STALE] User entity not found', { userId })
    }

    return {
      exists
    }
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error('[AUTH-VALIDATE-ERROR] Error validating user entity', {
      error: errorMessage
    })

    setResponseStatus(event, 500)
    return {
      exists: false,
      error: errorMessage
    }
  }
})
