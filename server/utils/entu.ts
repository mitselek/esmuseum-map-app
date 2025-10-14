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

  logger.debug(`Making API call to: ${endpoint}`, {
    method: options.method || 'GET',
    url,
    hasBody: !!options.body
  })

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

    // Log response status - more concise for successful calls
    if (!response.ok) {
      logger.warn('Entu API call failed', {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        url
      })
    }
    else {
      logger.debug('Entu API call successful', {
        endpoint,
        status: response.status,
        contentLength: response.headers.get('content-length')
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
  logger.debug(`Getting entity: ${entityId}`, { properties })
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

  logger.debug(`Creating entity of type: ${entityType}`, { properties })

  // COMPARISON DEBUG: Log exact properties array being sent
  console.log('🔍 SERVER-SIDE PROPERTIES ARRAY:')
  console.log('Entity Type:', entityType)
  console.log('Properties Array:', JSON.stringify(properties, null, 2))
  console.log('Properties Stringified:', JSON.stringify(properties))

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
  logger.debug(`Updating entity: ${entityId}`, { entityData })
  return callEntuApi(`/entity/${entityId}`, {
    method: 'POST',
    body: JSON.stringify(entityData)
  }, apiConfig)
}

/**
 * Search entities in Entu
 */
export async function searchEntuEntities (query: Record<string, any>, apiConfig: EntuApiOptions) {
  logger.debug('Searching entities', { query })
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

  const apiConfig = {
    token,
    apiUrl: (config.entuApiUrl as string) || 'https://entu.app',
    accountName: (config.entuClientId as string) || 'esmuuseum'
  }

  logger.debug('Created API config', {
    url: apiConfig.apiUrl,
    account: apiConfig.accountName,
    hasToken: !!token
  })

  return apiConfig
}

/**
 * Get file upload URL for an entity
 */
export async function getFileUploadUrl (entityId: string, fileInfo: { type: string, filename: string, filesize: number, filetype: string }, apiConfig: EntuApiOptions) {
  logger.debug(`Getting file upload URL for entity: ${entityId}`, { fileInfo })

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
  logger.debug('Uploading file to external URL', {
    url: uploadUrl,
    fileSize: file.length,
    headers: Object.keys(headers)
  })

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers,
      body: file as BodyInit
    })

    if (!response.ok) {
      logger.warn(`File upload failed: ${response.status} ${response.statusText}`)
      throw createError({
        statusCode: response.status,
        statusMessage: `File upload failed: ${response.status} ${response.statusText}`
      })
    }

    logger.debug('File upload successful')
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
