/**
 * Server-side Entu API utilities
 * Handles communication with Entu API from server context
 */

export interface EntuApiOptions {
  token: string
  apiUrl: string
  accountName: string
}

/**
 * Make authenticated API call to Entu
 */
export async function callEntuApi(endpoint: string, options: Partial<RequestInit> = {}, apiConfig: EntuApiOptions) {
  const url = `${apiConfig.apiUrl}/api/${apiConfig.accountName}${endpoint}`
  
  const requestOptions: RequestInit = {
    headers: {
      'Authorization': `Bearer ${apiConfig.token}`,
      'Accept-Encoding': 'deflate',
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Entu API error: ${response.status} ${response.statusText}`
      })
    }

    return await response.json()
  } catch (error) {
    console.error('Entu API call failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to communicate with Entu API'
    })
  }
}

/**
 * Get entity by ID from Entu
 */
export async function getEntuEntity(entityId: string, apiConfig: EntuApiOptions) {
  return callEntuApi(`/entity/${entityId}`, {}, apiConfig)
}

/**
 * Create entity in Entu
 */
export async function createEntuEntity(entityType: string, entityData: any, apiConfig: EntuApiOptions) {
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
export async function updateEntuEntity(entityId: string, entityData: any, apiConfig: EntuApiOptions) {
  return callEntuApi(`/entity/${entityId}`, {
    method: 'POST',
    body: JSON.stringify(entityData)
  }, apiConfig)
}

/**
 * Search entities in Entu
 */
export async function searchEntuEntities(query: Record<string, any>, apiConfig: EntuApiOptions) {
  const queryString = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  
  return callEntuApi(`/entity?${queryString}`, {}, apiConfig)
}

/**
 * Get Entu API configuration from runtime config
 */
export function getEntuApiConfig(token: string): EntuApiOptions {
  const config = useRuntimeConfig()
  
  return {
    token,
    apiUrl: (config.public.entuUrl as string) || 'https://entu.app',
    accountName: (config.public.entuAccount as string) || 'esmuuseum'
  }
}
