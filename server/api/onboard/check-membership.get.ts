/**
 * Server Endpoint: GET /api/onboard/check-membership (FEAT-001)
 * 
 * Checks if a user is a member of a group
 * Used by polling logic to confirm membership after assignment
 * 
 * @see specs/030-student-onboarding-flow/spec.md
 */

import { getEntuApiConfig, searchEntuEntities, exchangeApiKeyForToken } from '../../utils/entu'
import { createLogger } from '../../utils/logger'
import type { EntuPerson, EntuEntityListResponse } from '../../../types/entu'

const logger = createLogger('check-membership')

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    
    if (!query.groupId || !query.userId || typeof query.groupId !== 'string' || typeof query.userId !== 'string') {
      setResponseStatus(event, 400)
      return {
        isMember: false,
        error: 'Missing groupId or userId',
      }
    }

    const { groupId, userId } = query

    // Exchange API key for JWT token
    const jwtToken = await exchangeApiKeyForToken(config.entuManagerKey as string)
    const apiConfig = getEntuApiConfig(jwtToken)

    const searchResults = await searchEntuEntities({
      '_type.string': 'person',
      '_parent.reference': groupId,
    }, apiConfig) as EntuEntityListResponse<EntuPerson>

    const isMember = searchResults.entities?.some(entity => entity._id === userId) || false

    return {
      isMember,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logger.error('Error checking membership', {
      error: errorMessage,
    })

    setResponseStatus(event, 500)
    return {
      isMember: false,
      error: errorMessage,
    }
  }
})
