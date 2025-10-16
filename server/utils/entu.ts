/**
 * Server-side Entu API utilities
 * Handles communication with Entu API from server context
 */

import { createLogger } from './logger'

// Create a logger for this module
const logger = createLogger('entu')

export interface EntuApiOptions {
  token: string
  apiUrl: string
  accountName: string
}

interface EntuProperty {
  type: string
  string?: string
  reference?: string
  number?: number
  boolean?: boolean
}

/**
 * Make authenticated API call to Entu
 */
export async function callEntuApi (endpoint: string, options: Partial<RequestInit> = {}, apiConfig: EntuApiOptions) {
  const url = `${apiConfig.apiUrl}/api/${apiConfig.accountName}${endpoint}`

  const requestOptions: RequestInit = {
    headers: {
      Authorization: `Bearer ${apiConfig.token}`,
      'Accept-Encoding': 'deflate',
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      logger.warn('Entu API call failed', {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
      })
    }

    if (!response.ok) {
      // Try to get the response body for more detailed error info
      let errorDetails = ''
      try {
        const errorBody = await response.text()
        errorDetails = errorBody
        logger.error('Entu API error response body', {
          endpoint,
          status: response.status,
          body: errorDetails,
          url
        })
      }
      catch (e) {
        logger.warn('Could not read error response body', e)
      }

      throw createError({
        statusCode: response.status,
        statusMessage: `Entu API error: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`
      })
    }

    const data = await response.json()
    return data
  }
  catch (error) {
    logger.error(`Entu API call failed: ${endpoint}`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to communicate with Entu API'
    })
  }
}

/**
 * Get entity by ID from Entu
 */
export async function getEntuEntity (entityId: string, apiConfig: EntuApiOptions, properties?: string) {
  let endpoint = `/entity/${entityId}`
  if (properties) {
    endpoint += `?props=${encodeURIComponent(properties)}`
  }
  return callEntuApi(endpoint, {}, apiConfig)
}

/**
 * Create entity in Entu
 */
export async function createEntuEntity (entityType: string, entityData: any, apiConfig: EntuApiOptions) {
  // Convert flat object to Entu property array format
  const properties: EntuProperty[] = [
    { type: '_type', reference: getEntityTypeReference(entityType) }, // Use proper reference
    { type: '_inheritrights', boolean: true } // Always add inheritrights for new entities
  ]

  // Add each property from entityData
  for (const [key, value] of Object.entries(entityData)) {
    if (value !== null && value !== undefined) {
      if (key === 'ulesanne' || key === '_parent') {
        // Reference properties
        properties.push({ type: key, reference: value as string })
      }
      else if (key === 'valitud_asukoht') {
        // Selected location reference - special handling to include proper structure
        properties.push({ type: key, reference: value as string })
      }
      else if (typeof value === 'string') {
        // String properties
        properties.push({ type: key, string: value })
      }
      else if (typeof value === 'number') {
        // Number properties
        properties.push({ type: key, number: value })
      }
      else if (typeof value === 'boolean') {
        // Boolean properties (including _inheritrights, etc.)
        properties.push({ type: key, boolean: value })
      }
    }
  }

  return callEntuApi('/entity', {
    method: 'POST',
    body: JSON.stringify(properties)
  }, apiConfig)
}

/**
 * Get entity type reference ID for proper Entu structure
 * These references should match the entity type definitions in Entu
 */
function getEntityTypeReference (entityType: string): string {
  const entityTypeMap: Record<string, string> = {
    vastus: '686917401749f351b9c82f58', // Standard response entity type
    ulesanne: '686917231749f351b9c82f4c', // Task entity type
    asukoht: '686917581749f351b9c82f5a', // Location entity type
    photo: '686917681749f351b9c82f5c' // Photo entity type (placeholder - needs actual ID)
  }

  return entityTypeMap[entityType] || entityType
}

/**
 * Update entity in Entu
 */
export async function updateEntuEntity (entityId: string, entityData: any, apiConfig: EntuApiOptions) {
  return callEntuApi(`/entity/${entityId}`, {
    method: 'POST',
    body: JSON.stringify(entityData)
  }, apiConfig)
}

/**
 * Search entities in Entu
 */
export async function searchEntuEntities (query: Record<string, any>, apiConfig: EntuApiOptions) {
  const queryString = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

  return callEntuApi(`/entity?${queryString}`, {}, apiConfig)
}

/**
 * Get Entu API configuration from runtime config
 */
export function getEntuApiConfig (token: string): EntuApiOptions {
  const config = useRuntimeConfig()

  return {
    token,
    apiUrl: (config.entuApiUrl as string) || 'https://entu.app',
    accountName: (config.entuClientId as string) || 'esmuuseum'
  }
}

/**
 * Exchange API key for JWT token
 * The manager key is an API key that needs to be exchanged for a JWT token before use
 */
export async function exchangeApiKeyForToken (apiKey: string): Promise<string> {
  const config = useRuntimeConfig()
  const apiUrl = (config.entuApiUrl as string) || 'https://entu.app'
  const accountName = (config.entuClientId as string) || 'esmuuseum'
  
  const authUrl = `${apiUrl}/api/auth?account=${accountName}`
  
  try {
    const response = await fetch(authUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Accept-Encoding': 'deflate'
      }
    })
    
    if (!response.ok) {
      const errorBody = await response.text()
      logger.error('Failed to exchange API key for token', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      })
      throw createError({
        statusCode: response.status,
        statusMessage: `Token exchange failed: ${response.status} ${response.statusText}`
      })
    }
    
    const data = await response.json()
    
    if (!data.token) {
      logger.error('No token in auth response', { data })
      throw createError({
        statusCode: 500,
        statusMessage: 'No token returned from auth endpoint'
      })
    }
    
    return data.token
  } catch (error) {
    logger.error('Token exchange error', error)
    throw error
  }
}

/**
 * Get file upload URL for an entity
 */
export async function getFileUploadUrl (entityId: string, fileInfo: { type: string, filename: string, filesize: number, filetype: string }, apiConfig: EntuApiOptions) {
  const properties = [fileInfo]

  return callEntuApi(`/entity/${entityId}`, {
    method: 'POST',
    body: JSON.stringify(properties)
  }, apiConfig)
}

/**
 * Upload file to provided URL
 */
export async function uploadFileToUrl (uploadUrl: string, file: Buffer | Uint8Array, headers: Record<string, string> = {}) {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers,
      body: file as BodyInit
    })

    if (!response.ok) {
      logger.warn('File upload failed', {
        status: response.status,
        statusText: response.statusText
      })
      throw createError({
        statusCode: response.status,
        statusMessage: `File upload failed: ${response.status} ${response.statusText}`
      })
    }

    return response
  }
  catch (error) {
    logger.error('File upload failed', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload file'
    })
  }
}
