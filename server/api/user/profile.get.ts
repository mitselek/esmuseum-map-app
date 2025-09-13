/**
 * GET /api/user/profile
 * Get current user's profile with groups
 * Compatible with current client-side implementation
 */

import { withAuth, extractBearerToken } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { getEntuEntity, getEntuApiConfig } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('user-profile')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    try {
      const apiConfig = getEntuApiConfig(extractBearerToken(event))

      // Get user's full profile using their ID
      const userProfileResult = await getEntuEntity(user._id, apiConfig)

      if (!userProfileResult) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User profile not found'
        })
      }

      // Extract the actual entity from the response
      // Entu API returns { entity: { ... } } format
      const userEntity = userProfileResult.entity || userProfileResult

      // Return in the exact same format as client getEntity call
      // Client expects: userProfileResponse.entity
      return {
        entity: userEntity
      }
    }
    catch (error: any) {
      logger.error('Failed to get user profile', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get user profile'
      })
    }
  })
})
