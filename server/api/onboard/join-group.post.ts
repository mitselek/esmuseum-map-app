/**
 * Server Endpoint: POST /api/onboard/join-group (FEAT-001)
 * 
 * Assigns a student (user) to a group (class) in Entu
 * Server-side only (called from client composables)
 * 
 * @see specs/030-student-onboarding-flow/spec.md
 */

import type { GroupAssignmentRequest, GroupAssignmentResponse } from '../../../types/onboarding'
import { callEntuApi, getEntuApiConfig, searchEntuEntities, exchangeApiKeyForToken } from '../../utils/entu'
import { createLogger } from '../../utils/logger'
import type { EntuPerson, EntuEntityListResponse } from '../../../types/entu'

const logger = createLogger('onboard-join-group')

export default defineEventHandler(async (event): Promise<GroupAssignmentResponse> => {
  try {
    const config = useRuntimeConfig()

    // Parse and validate request body
    const body = await readBody<GroupAssignmentRequest>(event)
    
    if (!body || !body.groupId || !body.userId) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: 'Bad Request: Missing groupId or userId',
      }
    }

    const { groupId, userId } = body

    logger.info('Group assignment request', {
      groupId,
      userId,
      timestamp: new Date().toISOString(),
    })

    // Exchange API key for JWT token
    const jwtToken = await exchangeApiKeyForToken(config.entuManagerKey as string)
    const apiConfig = getEntuApiConfig(jwtToken)

    // 3. Check if user is already a member
    try {
      const searchResults = await searchEntuEntities({
        '_type.string': 'person',
        '_parent.reference': groupId,
      }, apiConfig) as EntuEntityListResponse<EntuPerson>

      const isMember = searchResults.entities?.some(entity => entity._id === userId)

      if (isMember) {
        logger.info('User already member of group', { groupId, userId })
        return {
          success: true,
          message: 'User is already a member of this group',
        }
      }
    } catch (error: unknown) {
      // Log but continue - may be a new group with no members yet
      logger.warn('Error checking existing membership', {
        error: error instanceof Error ? error.message : String(error),
        groupId,
        userId,
      })
    }

    // 4. Assign user to group by adding _parent reference to user entity
    // Manager key must have permission to edit the user's _parent property
    try {
      await callEntuApi(`/entity/${userId}`, {
        method: 'POST',
        body: JSON.stringify([{
          type: '_parent',
          reference: groupId,
        }]),
      }, apiConfig)

      logger.info('Successfully assigned user to group', {
        groupId,
        userId,
        timestamp: new Date().toISOString(),
      })

      return {
        success: true,
        message: 'User successfully assigned to group',
      }
    } catch (apiError: unknown) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown Entu API error'
      
      logger.error('Entu API error during group assignment', {
        error: errorMessage,
        groupId,
        userId,
      })

      setResponseStatus(event, 500)
      return {
        success: false,
        error: `Entu API Error: ${errorMessage}`,
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    logger.error('Unexpected error in join-group endpoint', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })

    setResponseStatus(event, 500)
    return {
      success: false,
      error: `Server Error: ${errorMessage}`,
    }
  }
})
