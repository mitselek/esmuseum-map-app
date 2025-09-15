/**
 * POST /api/upload
 * Handle file upload for task responses
 * 
 * This endpoint:
 * 1. Requests upload URL from Entu by adding photo property to existing response entity
 * 2. Uploads the file to the provided URL
 * 3. Returns the upload results
 */

import { withAuth } from '../utils/auth'
import { createLogger } from '../utils/logger'
import type { AuthenticatedUser } from '../utils/auth'
import { createEntuEntity, getFileUploadUrl, uploadFileToUrl, getEntuApiConfig } from '../utils/entu'
import { createSuccessResponse } from '../utils/validation'

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]

export default defineEventHandler(async (event) => {
  const logger = createLogger('api:upload')
  
  return withAuth(event, async (event: any, user: AuthenticatedUser) => {
    // Only allow POST method
    assertMethod(event, 'POST')

    try {
      // Parse multipart form data
      const formData = await readMultipartFormData(event)
      
      if (!formData || formData.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No files provided'
        })
      }

      // Get parent entity ID from form data
      const parentEntityIdField = formData.find(field => field.name === 'parentEntityId')
      if (!parentEntityIdField) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Parent entity ID is required'
        })
      }
      const parentEntityId = parentEntityIdField.data.toString()

      // Get API config
      const apiConfig = getEntuApiConfig(extractBearerToken(event))
      
      // Process files
      const uploadResults = []
      
      for (const field of formData) {
        if (field.name === 'file' && field.filename && field.data) {
          try {
            // Validate file
            const validation = validateFile(field)
            if (!validation.isValid) {
              uploadResults.push({
                filename: field.filename,
                success: false,
                error: validation.error
              })
              continue
            }

            // Step 1: Request upload metadata by adding photo property to the response entity
            const uploadMetadata = await getFileUploadUrl(parentEntityId, {
              type: 'photo',
              filename: field.filename,
              filesize: field.data.length,
              filetype: field.type || 'application/octet-stream'
            }, apiConfig)

            if (!uploadMetadata?.properties?.[0]?.upload) {
              throw new Error('No upload information received from server')
            }

            // Step 2: Upload file to the provided URL
            const uploadInfo = uploadMetadata.properties[0].upload
            await uploadFileToUrl(
              uploadInfo.url,
              field.data,
              uploadInfo.headers || {}
            )

            uploadResults.push({
              filename: field.filename,
              success: true,
              entityId: parentEntityId, // The file is attached to the response entity
              size: field.data.length,
              type: field.type
            })

          } catch (error: any) {
            logger.error(`Failed to upload file ${field.filename}`, error)
            uploadResults.push({
              filename: field.filename,
              success: false,
              error: error.message || 'Upload failed'
            })
          }
        }
      }

      // Return results
      return createSuccessResponse({
        uploads: uploadResults,
        message: `Processed ${uploadResults.length} file(s)`,
        successCount: uploadResults.filter(r => r.success).length,
        errorCount: uploadResults.filter(r => !r.success).length
      })

    } catch (error: any) {
      logger.error('File upload failed', error)

      // Re-throw known errors
      if (error?.statusCode) {
        throw error
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to process file upload'
      })
    }
  })
})

/**
 * Validate uploaded file
 */
function validateFile(field: any): { isValid: boolean, error?: string } {
  if (!field.filename) {
    return { isValid: false, error: 'Filename is required' }
  }

  if (!field.data || field.data.length === 0) {
    return { isValid: false, error: 'File data is empty' }
  }

  if (field.data.length > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File too large: ${field.filename} (${Math.round(field.data.length / 1024 / 1024)}MB). Maximum size is 10MB.`
    }
  }

  if (field.type && !ALLOWED_MIME_TYPES.includes(field.type)) {
    return { 
      isValid: false, 
      error: `File type not allowed: ${field.filename} (${field.type}). Allowed types: images, PDF, Word documents.`
    }
  }

  return { isValid: true }
}

/**
 * Helper function to extract Bearer token
 */
function extractBearerToken(event: any): string {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authorization header'
    })
  }
  return authHeader.substring(7).trim()
}