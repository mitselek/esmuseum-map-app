/**
 * PUT /api/responses/[id]
 * Update an existing task response
 */

import { validateUpdateResponseRequest, validateEntityId, createSuccessResponse } from '../../utils/validation'
import { withAuth, checkResponsePermission } from '../../utils/auth'
import type { AuthenticatedUser } from '../../utils/auth'
import { updateEntuEntity, getEntuApiConfig } from '../../utils/entu'
import { createLogger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const logger = createLogger('api:responses:put')

  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow PUT method
    assertMethod(event, 'PUT')

    // Get and validate response ID from URL
    const responseId = validateEntityId(getRouterParam(event, 'id'))

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = validateUpdateResponseRequest(body)

    // Check if user has permission to update this response
    const apiConfig = getEntuApiConfig(extractBearerToken(event))
    const hasPermission = await checkResponsePermission(user, responseId, apiConfig)

    if (!hasPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to update this response'
      })
    }

    try {
      // Prepare update data for Entu
      const updateData = {
        vastused: validatedData.responses.map((response: any) => ({
          kuesimusId: response.questionId,
          vastus: response.value,
          tuup: response.type,
          metadata: response.metadata
        })),
        muutmisaeg: new Date().toISOString(),
        staatus: 'muudetud'
      }

      // Update the response in Entu
      const updatedResponse = await updateEntuEntity(responseId, updateData, apiConfig)

      // Return success response
      return createSuccessResponse({
        id: responseId,
        message: 'Response updated successfully',
        updatedAt: updateData.muutmisaeg
      })
    }
    catch (error: any) {
      logger.error('Failed to update response', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update response'
      })
    }
  })
})

// Helper function to extract Bearer token
function extractBearerToken (event: any): string {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authorization header'
    })
  }
  return authHeader.substring(7).trim()
}
