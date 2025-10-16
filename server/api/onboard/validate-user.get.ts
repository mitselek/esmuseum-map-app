/**
 * Server Endpoint: GET /api/onboard/validate-user (BUG-023)
 *
 * Validates if a user entity exists in Entu
 * Used to detect stale authentication when user entity has been deleted
 *
 * Performance: Uses direct entity fetch instead of search (Copilot review)
 *
 * @see https://github.com/mitselek/esmuseum-map-app/issues/23
 */

import { getEntuApiConfig, getEntuEntity, exchangeApiKeyForToken } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

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

    // Direct entity fetch - more efficient than search
    try {
      await getEntuEntity(userId, apiConfig)
      // If no error thrown, entity exists
      logger.info('[AUTH-VALID] User entity confirmed', { userId })
      return {
        exists: true
      }
    }
    catch (fetchError: unknown) {
      // 404 or other error means entity doesn't exist or is inaccessible
      logger.warn('[AUTH-STALE] User entity not found', { userId })
      return {
        exists: false
      }
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
