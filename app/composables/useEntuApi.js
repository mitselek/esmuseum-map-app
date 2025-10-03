/**
 * Entu API Composable
 *
 * Provides methods for interacting with the Entu API
 * Uses the useEntuAuth composable for authentication
 *
 * CRITICAL FIX (Phase 3.1): Object spread order in callApi was overwriting
 * Authorization headers for POST requests. Fixed by spreading options first,
 * then constructing headers object to ensure Authorization header is preserved.
 */

import { ENTU_TYPES, ENTU_PROPERTIES } from '../constants/entu'

export const useEntuApi = () => {
  const { token, isAuthenticated, refreshToken } = useEntuAuth()

  // Runtime configuration
  const config = useRuntimeConfig()
  const apiUrl = computed(() => config.public.entuUrl || 'https://entu.app')
  const accountName = computed(() => config.public.entuAccount || 'esmuuseum')

  // API state
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Get base API URL for the current account
   */
  const getApiBase = () => {
    return `${apiUrl.value}/api/${accountName.value}`
  }

  /**
   * Perform an API call with automatic token handling
   */
  const callApi = async (endpoint, options = {}) => {
    isLoading.value = true
    error.value = null

    try {
      // Ensure we have a valid token
      if (!isAuthenticated.value) {
        await refreshToken()
      }

      // Build request options with authentication
      // CRITICAL: Spread options first, then override headers to preserve Authorization header
      const requestOptions = {
        ...options,
        headers: {
          Authorization: `Bearer ${token.value}`,
          'Accept-Encoding': 'deflate',
          ...options.headers
        }
      }

      // Make the API request
      const url = `${getApiBase()}${endpoint}`
      const response = await fetch(url, requestOptions)

      if (response.status === 401) {
        // Token expired, try refreshing and retry once
        await refreshToken(true)

        // Retry the request with the new token
        requestOptions.headers.Authorization = `Bearer ${token.value}`
        const retryResponse = await fetch(url, requestOptions)

        if (!retryResponse.ok) {
          throw new Error(`API error: ${retryResponse.status} ${retryResponse.statusText}`)
        }

        return await retryResponse.json()
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    }
    catch (err) {
      error.value = err.message || 'API call failed'
      console.error('Entu API error:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Get an entity by ID
   */
  const getEntity = async (entityId) => {
    return callApi(`/entity/${entityId}`)
  }

  /**
   * Search for entities
   */
  const searchEntities = async (query) => {
    // Build the query string,
    // if limit is not specified, add a default limit=1000
    if (!query.limit) {
      query.limit = 1000
    }
    const queryString = Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    return callApi(`/entity?${queryString}`)
  }

  /**
   * Create a new entity
   */
  const createEntity = async (entityData) => {
    return callApi('/entity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'deflate'
      },
      body: JSON.stringify(entityData)
    })
  }

  /**
   * Update an existing entity
   */
  const updateEntity = async (entityId, entityData) => {
    return callApi(`/entity/${entityId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entityData)
    })
  }

  /**
   * Delete an entity
   */
  const deleteEntity = async (entityId) => {
    return callApi(`/entity/${entityId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get entity types from Entu
   */
  const getEntityTypes = async () => {
    return searchEntities({
      [ENTU_PROPERTIES.TYPE_STRING]: ENTU_TYPES.ENTITY
    })
  }

  /**
   * Get entities by type
   */
  const getEntitiesByType = async (type, props = null, limit = 100) => {
    const query = {
      [ENTU_PROPERTIES.TYPE_STRING]: type,
      limit: limit
    }

    if (props) {
      query.props = props
    }

    return searchEntities(query)
  }

  /**
   * Get file upload URL
   */
  const getFileUploadUrl = async (entityId, properties) => {
    return callApi(`/entity/${entityId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(properties)
    })
  }

  /**
   * Get account information from Entu API
   */
  const getAccountInfo = async () => {
    return callApi('') // Empty endpoint returns account info
  }

  return {
    isLoading,
    error,
    getApiBase,
    callApi,
    getEntity,
    searchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    getEntityTypes,
    getEntitiesByType,
    getFileUploadUrl,
    getAccountInfo
  }
}
