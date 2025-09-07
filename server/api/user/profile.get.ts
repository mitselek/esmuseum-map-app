/**
 * GET /api/user/profile
 * Get current user's profile with groups
 * Compatible with current client-side implementation
 */

import { withAuth, type AuthenticatedUser, extractBearerToken } from '../../utils/auth'
import { getEntuEntity, getEntuApiConfig } from '../../utils/entu'

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

      // Debug: Log what we're returning
      console.log('Server returning user profile structure:', {
        hasParent: !!userProfileResult._parent,
        parentCount: userProfileResult._parent?.length || 0,
        parentTypes: userProfileResult._parent?.map((p: any) => p.entity_type) || [],
        sampleParent: userProfileResult._parent?.[0]
      })

      // Return in the exact same format as client getEntity call
      // Client expects: userProfileResponse.entity
      return {
        entity: userProfileResult
      }

    } catch (error: any) {
      console.error('Failed to get user profile:', error)
      
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
