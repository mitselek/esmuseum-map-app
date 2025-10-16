/**
 * Server Endpoint: GET /api/onboard/get-group-info (FEAT-001)
 *
 * Fetches group information from Entu (name, etc.)
 * Server-side proxy - uses admin API key internally
 *
 * @see specs/030-student-onboarding-flow/spec.md
 */

import { createLogger } from '../../utils/logger'
import { callEntuApi, getEntuApiConfig, exchangeApiKeyForToken } from '../../utils/entu'
import type { EntuGroup, EntuEntityResponse } from '../../../types/entu'

const logger = createLogger('onboard-get-group-info')

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const config = useRuntimeConfig()

    // Parse and validate query parameters
    if (!query.groupId || typeof query.groupId !== 'string') {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: 'Bad Request: Missing groupId'
      }
    }

    const groupId = query.groupId

    // Exchange API key for JWT token (server-side only)
    const jwtToken = await exchangeApiKeyForToken(config.entuManagerKey as string)
    const apiConfig = getEntuApiConfig(jwtToken)

    // Fetch group entity from Entu
    const groupData = await callEntuApi(`/entity/${groupId}`, {
      method: 'GET'
    }, apiConfig) as EntuEntityResponse<EntuGroup>

    // Extract group name from entity.name[0].string (see docs/model/grupp.sample.json)
    const groupName = groupData.entity.name?.[0]?.string || 'Unknown Group'

    logger.info('Group info fetched', { groupId, groupName })

    return {
      success: true,
      groupId,
      groupName
    }
  }
  catch (error: unknown) {
    logger.error('Failed to fetch group info', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      groupId: query?.groupId
    })

    setResponseStatus(event, 500)
    return {
      success: false,
      error: 'Failed to fetch group information',
      details: error instanceof Error ? error.message : String(error)
    }
  }
})
