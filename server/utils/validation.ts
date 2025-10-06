/**
 * Server-side validation utilities for F006 API endpoints
 * Uses Nuxt's built-in validation and error handling
 */

import { createLogger } from './logger'

// Create a logger for this module
const logger = createLogger('validation')

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
      locationId?: string // Add location reference
      coordinates?: {
        lat: number
        lng: number
      }
    }
  }>
  respondentName?: string
}

export interface UpdateResponseRequest {
  responses: Array<{
    questionId: string
    value: string
    type: 'text' | 'location' | 'file'
    metadata?: {
      fileName?: string
      fileSize?: number
      locationId?: string // Add location reference
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
 * Optional location query shape used by endpoints that compute distances
 */
export interface LocationQuery {
  lat?: number
  lng?: number
}

/**
 * Validate required string field
 */
export function validateRequiredString (value: any, fieldName: string): string {
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
export function validateRequiredArray (value: any, fieldName: string): any[] {
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
export function validateResponseType (type: any): 'text' | 'location' | 'file' {
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
export function validateCoordinates (coords: any): { lat: number, lng: number } {
  logger.debug('Validating coordinates', { coords })

  if (!coords || typeof coords !== 'object') {
    logger.warn('Invalid coordinates structure')
    throw createError({
      statusCode: 400,
      statusMessage: 'Coordinates must be an object with lat and lng properties'
    })
  }

  const lat = parseFloat(coords.lat)
  const lng = parseFloat(coords.lng)

  if (isNaN(lat) || isNaN(lng)) {
    logger.warn('Invalid coordinate values', { lat: coords.lat, lng: coords.lng })
    throw createError({
      statusCode: 400,
      statusMessage: 'Coordinates lat and lng must be valid numbers'
    })
  }

  if (lat < -90 || lat > 90) {
    logger.warn('Latitude out of range', { lat })
    throw createError({
      statusCode: 400,
      statusMessage: 'Latitude must be between -90 and 90'
    })
  }

  if (lng < -180 || lng > 180) {
    logger.warn('Longitude out of range', { lng })
    throw createError({
      statusCode: 400,
      statusMessage: 'Longitude must be between -180 and 180'
    })
  }

  logger.debug('Coordinates validated successfully', { lat, lng })
  return { lat, lng }
}

/**
 * Validate response item structure
 */
export function validateResponseItem (item: any, index: number) {
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

    if (item.metadata.locationId) {
      metadata.locationId = validateRequiredString(item.metadata.locationId, `responses[${index}].metadata.locationId`)
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
export function validateCreateResponseRequest (body: any): CreateResponseRequest {
  logger.debug('Validating create response request', { hasBody: !!body })

  if (!body || typeof body !== 'object') {
    logger.warn('Invalid request body structure')
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body must be a JSON object'
    })
  }

  const taskId = validateRequiredString(body.taskId, 'taskId')
  const responsesArray = validateRequiredArray(body.responses, 'responses')

  logger.debug('Validating response items', { responseCount: responsesArray.length })
  const responses = responsesArray.map((item, index) => validateResponseItem(item, index))

  let respondentName: string | undefined
  if (body.respondentName !== undefined && body.respondentName !== null) {
    respondentName = validateRequiredString(body.respondentName, 'respondentName')
  }

  logger.debug('Create response request validated successfully', { taskId, responseCount: responses.length })
  const result: CreateResponseRequest = { taskId, responses }
  if (respondentName) {
    result.respondentName = respondentName
  }

  return result
}

/**
 * Validate update response request body
 */
export function validateUpdateResponseRequest (body: any): UpdateResponseRequest {
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
export function createSuccessResponse<T> (data: T): ApiResponse<T> {
  return {
    success: true,
    data
  }
}

/**
 * Validate entity ID parameter
 */
export function validateEntityId (id: any): string {
  logger.debug('Validating entity ID', { id })

  const entityId = validateRequiredString(id, 'id')

  // Basic MongoDB ObjectId format validation (24 hex characters)
  if (!/^[a-fA-F0-9]{24}$/.test(entityId)) {
    logger.warn('Invalid entity ID format', { entityId })
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid entity ID format'
    })
  }

  logger.debug('Entity ID validated successfully', { entityId })
  return entityId
}

/**
 * Validate optional lat/lng query parameters.
 * Returns an object with numeric lat/lng only if both are present and valid.
 */
export function validateLocationQuery (query: any): LocationQuery {
  logger.debug('Validating location query', { query })

  const latRaw = query?.lat ?? query?.latitude
  const lngRaw = query?.lng ?? query?.long ?? query?.longitude

  if (latRaw === undefined && lngRaw === undefined) {
    logger.debug('No location parameters provided')
    return {}
  }

  if (latRaw === undefined || lngRaw === undefined) {
    logger.warn('Incomplete location parameters', { latRaw, lngRaw })
    throw createError({
      statusCode: 400,
      statusMessage: 'Both lat and lng must be provided together'
    })
  }

  const lat = parseFloat(String(latRaw))
  const lng = parseFloat(String(lngRaw))

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    logger.warn('Invalid location parameter types', { latRaw, lngRaw })
    throw createError({
      statusCode: 400,
      statusMessage: 'lat and lng must be valid numbers'
    })
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    logger.warn('Location parameters out of range', { lat, lng })
    throw createError({
      statusCode: 400,
      statusMessage: 'lat must be [-90,90] and lng must be [-180,180]'
    })
  }

  logger.debug('Location query validated successfully', { lat, lng })
  return { lat, lng }
}

/**
 * Calculate distance in meters between two coordinates using the Haversine formula
 */
export function calculateDistance (lat1: number, lng1: number, lat2: number, lng2: number): number {
  logger.debug('Calculating distance', { from: { lat: lat1, lng: lng1 }, to: { lat: lat2, lng: lng2 } })

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000 // meters
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a
    = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
      * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  logger.debug('Distance calculated', { distance: Math.round(distance) })
  return distance
}
