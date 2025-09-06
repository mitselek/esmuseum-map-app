/**
 * Server-side validation utilities for F006 API endpoints
 * Uses Nuxt's built-in validation and error handling
 */

// TypeScript interfaces for type safety
export interface CreateResponseRequest {
  taskId: string
  responses: Array<{
    questionId: string
    value: string
    type: 'text' | 'location' | 'file'
    metadata?: {
      fileName?: string
      fileSize?: number
      coordinates?: {
        lat: number
        lng: number
      }
    }
  }>
}

export interface UpdateResponseRequest {
  responses: Array<{
    questionId: string
    value: string
    type: 'text' | 'location' | 'file'
    metadata?: {
      fileName?: string
      fileSize?: number
      coordinates?: {
        lat: number
        lng: number
      }
    }
  }>
}

export interface ApiResponse<T = any> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

/**
 * Validate required string field
 */
export function validateRequiredString(value: any, fieldName: string): string {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldName} is required and must be a non-empty string`
    })
  }
  return value.trim()
}

/**
 * Validate required array field
 */
export function validateRequiredArray(value: any, fieldName: string): any[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldName} is required and must be a non-empty array`
    })
  }
  return value
}

/**
 * Validate response type enum
 */
export function validateResponseType(type: any): 'text' | 'location' | 'file' {
  const validTypes = ['text', 'location', 'file']
  if (!validTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Response type must be one of: ${validTypes.join(', ')}`
    })
  }
  return type
}

/**
 * Validate coordinates object
 */
export function validateCoordinates(coords: any): { lat: number; lng: number } {
  if (!coords || typeof coords !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Coordinates must be an object with lat and lng properties'
    })
  }

  const lat = parseFloat(coords.lat)
  const lng = parseFloat(coords.lng)

  if (isNaN(lat) || isNaN(lng)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Coordinates lat and lng must be valid numbers'
    })
  }

  if (lat < -90 || lat > 90) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Latitude must be between -90 and 90'
    })
  }

  if (lng < -180 || lng > 180) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Longitude must be between -180 and 180'
    })
  }

  return { lat, lng }
}

/**
 * Validate response item structure
 */
export function validateResponseItem(item: any, index: number) {
  if (!item || typeof item !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: `Response item ${index} must be an object`
    })
  }

  const questionId = validateRequiredString(item.questionId, `responses[${index}].questionId`)
  const value = validateRequiredString(item.value, `responses[${index}].value`)
  const type = validateResponseType(item.type)

  const validatedItem: CreateResponseRequest['responses'][0] = {
    questionId,
    value,
    type
  }

  // Validate metadata if present
  if (item.metadata && typeof item.metadata === 'object') {
    const metadata: any = {}

    if (item.metadata.fileName) {
      metadata.fileName = validateRequiredString(item.metadata.fileName, `responses[${index}].metadata.fileName`)
    }

    if (item.metadata.fileSize !== undefined) {
      const fileSize = parseInt(item.metadata.fileSize)
      if (isNaN(fileSize) || fileSize < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: `responses[${index}].metadata.fileSize must be a positive number`
        })
      }
      metadata.fileSize = fileSize
    }

    if (item.metadata.coordinates) {
      metadata.coordinates = validateCoordinates(item.metadata.coordinates)
    }

    if (Object.keys(metadata).length > 0) {
      validatedItem.metadata = metadata
    }
  }

  return validatedItem
}

/**
 * Validate create response request body
 */
export function validateCreateResponseRequest(body: any): CreateResponseRequest {
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body must be a JSON object'
    })
  }

  const taskId = validateRequiredString(body.taskId, 'taskId')
  const responsesArray = validateRequiredArray(body.responses, 'responses')

  const responses = responsesArray.map((item, index) => validateResponseItem(item, index))

  return { taskId, responses }
}

/**
 * Validate update response request body
 */
export function validateUpdateResponseRequest(body: any): UpdateResponseRequest {
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body must be a JSON object'
    })
  }

  const responsesArray = validateRequiredArray(body.responses, 'responses')
  const responses = responsesArray.map((item, index) => validateResponseItem(item, index))

  return { responses }
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  }
}

/**
 * Validate entity ID parameter
 */
export function validateEntityId(id: any): string {
  const entityId = validateRequiredString(id, 'id')
  
  // Basic MongoDB ObjectId format validation (24 hex characters)
  if (!/^[a-fA-F0-9]{24}$/.test(entityId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid entity ID format'
    })
  }
  
  return entityId
}
