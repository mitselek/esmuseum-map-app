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

    if (!response.ok) {
      logger.warn(`API call failed: ${response.status} ${response.statusText}`, {
        endpoint,
        status: response.status,
        statusText: response.statusText
      })

      throw createError({
        statusCode: response.status,
        statusMessage: `Entu API error: ${response.status} ${response.statusText}`
      })
    }

    const data = await response.json()
    logger.debug(`API call successful: ${endpoint}`, {
      status: response.status,
      hasData: !!data
    })

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
export async function getEntuEntity (entityId: string, apiConfig: EntuApiOptions) {
  logger.debug(`Getting entity: ${entityId}`)
  return callEntuApi(`/entity/${entityId}`, {}, apiConfig)
}

/**
 * Create entity in Entu
 */
export async function createEntuEntity (entityType: string, entityData: any, apiConfig: EntuApiOptions) {
  logger.debug(`Creating entity of type: ${entityType}`, { entityData })
  return callEntuApi('/entity', {
    method: 'POST',
    body: JSON.stringify({
      _type: entityType,
      ...entityData
    })
  }, apiConfig)
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
    apiUrl: (config.public.entuUrl as string) || 'https://entu.app',
    accountName: (config.public.entuAccount as string) || 'esmuuseum'
  }

  logger.debug('Created API config', {
    url: apiConfig.apiUrl,
    account: apiConfig.accountName,
    hasToken: !!token
  })

  return apiConfig
}
