/**
 * Server Endpoint: POST /api/onboard/check-membership (FEAT-001)
 * 
 * Checks if a user is a member of a group
 * Used by polling logic to confirm membership after assignment
 * 
 * @see specs/030-student-onboarding-flow/spec.md
 */

import { getEntuApiConfig, searchEntuEntities } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('check-membership')

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody<{ groupId: string; userId: string }>(event)
    
    if (!body || !body.groupId || !body.userId) {
      setResponseStatus(event, 400)
      return {
        isMember: false,
        error: 'Missing groupId or userId',
      }
    }

    const { groupId, userId } = body

    const apiConfig = getEntuApiConfig(config.NUXT_ENTU_API_KEY as string)

    const existingMembers = await searchEntuEntities({
      '_type.string': 'person',
      '_parent.reference': groupId,
    }, apiConfig)

    const isMember = existingMembers?.entities?.some((entity: { _id: string }) => entity._id === userId) || false

    logger.debug('Membership check', {
      groupId,
      userId,
      isMember,
    })

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
