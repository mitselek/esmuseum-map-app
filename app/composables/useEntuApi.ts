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
import { analyzeApiError, handleAuthError } from '~/utils/error-handling'
import { notifyAuthRequired } from '~/composables/useNotifications'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * API request options
 */
export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>
}

/**
 * Entity search query parameters
 */
export interface EntitySearchQuery {
  [key: string]: string | number | undefined
  limit?: number
  props?: string
}

/**
 * Entu entity structure (generic)
 */
export interface EntuEntity {
  _id: string
  [key: string]: any
}

/**
 * Entu API response for entity list
 */
export interface EntityListResponse {
  entities: EntuEntity[]
  count?: number
}

/**
 * Entity data for creation/update
 */
export interface EntityData {
  [key: string]: any
}

/**
 * File upload URL response
 */
export interface FileUploadResponse {
  url?: string
  [key: string]: any
}

/**
 * Account information response
 */
export interface AccountInfo {
  account?: string
  [key: string]: any
}

/**
 * Return type of useEntuApi composable
 */
export interface UseEntuApiReturn {
  // State
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Methods
  getApiBase: () => string
  callApi: <T = any>(endpoint: string, options?: ApiRequestOptions) => Promise<T>
  getEntity: (entityId: string) => Promise<EntuEntity>
  searchEntities: (query: EntitySearchQuery) => Promise<EntityListResponse>
  createEntity: (entityData: EntityData) => Promise<EntuEntity>
  updateEntity: (entityId: string, entityData: EntityData) => Promise<EntuEntity>
  deleteEntity: (entityId: string) => Promise<void>
  getEntityTypes: () => Promise<EntityListResponse>
  getEntitiesByType: (type: string, props?: string | null, limit?: number) => Promise<EntityListResponse>
  getFileUploadUrl: (entityId: string, properties: EntityData) => Promise<FileUploadResponse>
  getAccountInfo: () => Promise<AccountInfo>
}

// ============================================================================
// Composable
// ============================================================================

export const useEntuApi = (): UseEntuApiReturn => {
  const { token, isAuthenticated, refreshToken } = useEntuAuth()

  // Runtime configuration
  const config = useRuntimeConfig()
  const apiUrl = computed(() => config.public.entuUrl as string || 'https://entu.app')
  const accountName = computed(() => config.public.entuAccount as string || 'esmuuseum')

  // API state
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get base API URL for the current account
   */
  const getApiBase = (): string => {
    return `${apiUrl.value}/api/${accountName.value}`
  }

  /**
   * Perform an API call with automatic token handling
   */
  const callApi = async <T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    isLoading.value = true
    error.value = null

    try {
      // Ensure we have a valid token
      if (!isAuthenticated.value) {
        await refreshToken()
      }

      // Build request options with authentication
      // CRITICAL: Spread options first, then override headers to preserve Authorization header
      const requestOptions: RequestInit = {
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

      if (response.status === 401 || response.status === 403) {
        // Authentication error - analyze and handle appropriately
        const errorAnalysis = analyzeApiError(response.status, `API call to ${endpoint}`)
        console.warn('[API] Authentication error:', errorAnalysis.technicalMessage)

        // Try refreshing token once
        if (response.status === 401) {
          await refreshToken(true)

          // Retry the request with the new token
          const retryHeaders = requestOptions.headers as Record<string, string>
          retryHeaders.Authorization = `Bearer ${token.value}`
          const retryResponse = await fetch(url, requestOptions)

          if (!retryResponse.ok) {
            // Still failed - handle auth error and throw
            const router = useRouter()
            const route = useRoute()
            handleAuthError(route.fullPath)
            
            // Show notification
            notifyAuthRequired()
            
            // Redirect to login
            router.push('/login')
            
            throw new Error(`API error: ${retryResponse.status} ${retryResponse.statusText}`)
          }

          return await retryResponse.json() as T
        }

        // 403 or refresh failed - redirect to login
        const router = useRouter()
        const route = useRoute()
        handleAuthError(route.fullPath)
        
        // Show notification
        notifyAuthRequired()
        
        router.push('/login')
        
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        // Other HTTP error - let it bubble up
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      return await response.json() as T
    }
    catch (err) {
      // Analyze error to determine type
      const errorAnalysis = analyzeApiError(err, `API call to ${endpoint}`)
      error.value = errorAnalysis.userMessage
      
      // Log technical details
      console.error('Entu API error:', errorAnalysis.technicalMessage)
      
      // If it's an auth error and we haven't already redirected, do it now
      if (errorAnalysis.shouldRedirectToLogin && import.meta.client) {
        const router = useRouter()
        const route = useRoute()
        handleAuthError(route.fullPath)
        
        // Show notification
        notifyAuthRequired()
        
        router.push('/login')
      }
      
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Get an entity by ID
   */
  const getEntity = async (entityId: string): Promise<EntuEntity> => {
    return callApi<EntuEntity>(`/entity/${entityId}`)
  }

  /**
   * Search for entities
   */
  const searchEntities = async (query: EntitySearchQuery): Promise<EntityListResponse> => {
    // Build the query string,
    // if limit is not specified, add a default limit=1000
    if (!query.limit) {
      query.limit = 1000
    }
    const queryString = Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    return callApi<EntityListResponse>(`/entity?${queryString}`)
  }

  /**
   * Create a new entity
   */
  const createEntity = async (entityData: EntityData): Promise<EntuEntity> => {
    return callApi<EntuEntity>('/entity', {
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
  const updateEntity = async (entityId: string, entityData: EntityData): Promise<EntuEntity> => {
    return callApi<EntuEntity>(`/entity/${entityId}`, {
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
  const deleteEntity = async (entityId: string): Promise<void> => {
    return callApi<void>(`/entity/${entityId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get entity types from Entu
   */
  const getEntityTypes = async (): Promise<EntityListResponse> => {
    return searchEntities({
      [ENTU_PROPERTIES.TYPE_STRING]: ENTU_TYPES.ENTITY
    })
  }

  /**
   * Get entities by type
   */
  const getEntitiesByType = async (
    type: string,
    props: string | null = null,
    limit: number = 100
  ): Promise<EntityListResponse> => {
    const query: EntitySearchQuery = {
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
  const getFileUploadUrl = async (
    entityId: string,
    properties: EntityData
  ): Promise<FileUploadResponse> => {
    return callApi<FileUploadResponse>(`/entity/${entityId}`, {
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
  const getAccountInfo = async (): Promise<AccountInfo> => {
    return callApi<AccountInfo>('') // Empty endpoint returns account info
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
