/**
 * Server Endpoint: POST /api/onboard/join-group (FEAT-001)
 * 
 * Assigns a student (user) to a group (class) in Entu
 * Requires NUXT_WEBHOOK_KEY for authentication
 * 
 * @see specs/030-student-onboarding-flow/spec.md
 */

import type { GroupAssignmentRequest, GroupAssignmentResponse } from '../../../types/onboarding'
import { callEntuApi, getEntuApiConfig, searchEntuEntities } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('onboard-join-group')

export default defineEventHandler(async (event): Promise<GroupAssignmentResponse> => {
  try {
    // 1. Validate webhook key
    const config = useRuntimeConfig()
    const providedKey = getHeader(event, 'x-webhook-key')
    
    if (!providedKey || providedKey !== config.NUXT_WEBHOOK_KEY) {
      setResponseStatus(event, 401)
      return {
        success: false,
        error: 'Unauthorized: Invalid webhook key',
      }
    }

    // 2. Parse and validate request body
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

    // Get API config with admin API key
    const apiConfig = getEntuApiConfig(config.NUXT_ENTU_API_KEY as string)

    // 3. Check if user is already a member
    try {
      const existingMembers = await searchEntuEntities({
        '_type.string': 'person',
        '_parent.reference': groupId,
      }, apiConfig)

      const isMember = existingMembers?.entities?.some((entity: { _id: string }) => entity._id === userId)

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

    // 4. Assign user to group by setting _parent property
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
