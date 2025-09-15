/**
 * GET /api/user/profile
 * Get current user's profile with groups
 * Compatible with current client-side implementation
 */

import { withAuth, extractJwtToken } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { getEntuEntity, getEntuApiConfig } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

const logger = createLogger('user-profile')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow GET method
    assertMethod(event, 'GET')

    try {
      const apiConfig = getEntuApiConfig(extractJwtToken(event))

      logger.info('Getting user profile', {
        userId: user._id,
        hasToken: !!apiConfig.token
      })

      // Only request the specific properties we need for group membership
      // This reduces response size and improves performance
      const requiredProperties = '_parent,_owner,_viewer,_editor,_expander,name,surname,forename,email'
      
      // Get user's profile with only the properties we need
      const userProfileResult = await getEntuEntity(user._id, apiConfig, requiredProperties)

      if (!userProfileResult) {
        logger.error('User profile not found', {
          userId: user._id,
          result: userProfileResult
        })
        throw createError({
          statusCode: 404,
          statusMessage: 'User profile not found'
        })
      }

      // Extract the actual entity from the response
      // Entu API returns { entity: { ... } } format
      const userEntity = userProfileResult.entity || userProfileResult

      logger.info('User profile retrieved successfully', {
        userId: user._id,
        hasEntity: !!userEntity,
        entityId: userEntity?._id
      })

      // Return in the exact same format as client getEntity call
      // Client expects: userProfileResponse.entity
      return {
        entity: userEntity
      }
    }
    catch (error: any) {
      logger.error('Failed to get user profile', {
        userId: user._id,
        error: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        data: error.data,
        cause: error.cause
      })

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
