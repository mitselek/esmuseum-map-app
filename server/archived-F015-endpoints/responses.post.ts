/**
 * POST /api/responses
 * Create a new task response
 */

import { validateCreateResponseRequest, createSuccessResponse } from '../utils/validation'
import { withAuth, checkTaskPermission } from '../utils/auth'
import type { AuthenticatedUser } from '../utils/auth'
import { createEntuEntity, getEntuApiConfig, searchEntuEntities } from '../utils/entu'
import { createLogger } from '../utils/logger'

const logger = createLogger('responses-post')

export default defineEventHandler(async (event) => {
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow POST method
    assertMethod(event, 'POST')

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = validateCreateResponseRequest(body)

    // Check if user has permission to respond to this task
    const apiConfig = getEntuApiConfig(extractBearerToken(event))
    const hasPermission = await checkTaskPermission(user, validatedData.taskId, apiConfig)

    if (!hasPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to respond to this task'
      })
    }

    try {
      // Check if user already has a response for this task
      const existingResponse = await searchEntuEntities({
        '_type.string': 'vastus',
        '_parent._id': validatedData.taskId,
        '_owner._id': user._id,
        limit: 1
      }, apiConfig)

      if (existingResponse.entities && existingResponse.entities.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Response already exists for this task. Use PUT to update.'
        })
      }

      // Prepare response data for Entu
      const responseData: any = {
        _parent: validatedData.taskId,
        kirjeldus: validatedData.responses[0]?.value || ''
      }

      if (validatedData.respondentName) {
        responseData.vastaja = validatedData.respondentName
      }

      // Add location reference if provided
      const locationId = validatedData.responses[0]?.metadata?.locationId
      if (locationId) {
        responseData.asukoht = locationId
      }

      // Add coordinates if provided
      const coordinates = validatedData.responses[0]?.metadata?.coordinates
      if (coordinates && coordinates.lat && coordinates.lng) {
        responseData.geopunkt = `${coordinates.lat},${coordinates.lng}`
      }

      // Create the response in Entu
      const createdResponse = await createEntuEntity('vastus', responseData, apiConfig)
      
      // COMPARISON DEBUG: Log what we actually sent to Entu
      console.log('🔍 SERVER-SIDE API CALL DEBUG:')
      console.log('URL:', `${apiConfig.apiUrl}/api/${apiConfig.accountName}/entity`)
      console.log('Method: POST')
      console.log('Headers:', {
        Authorization: `Bearer ${apiConfig.token?.substring(0, 20)}...`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'deflate'
      })
      console.log('Original responseData:', JSON.stringify(responseData, null, 2))
      // Note: The actual properties array is built inside createEntuEntity function
      
      logger.debug('Created response from Entu', createdResponse)

      // Return success response
      return createSuccessResponse({
        id: createdResponse._id || 'unknown',
        message: 'Response created successfully',
        submittedAt: new Date().toISOString(),
        data: createdResponse
      })
    }
    catch (error: any) {
      logger.error('Failed to create response', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create response'
      })
    }
  })
})

// Helper function to extract Bearer token (avoiding circular import)
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
