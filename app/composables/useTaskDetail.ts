/**
 * Composable for task detail panel functionality
 *
 * MIGRATED TO TYPESCRIPT: October 3, 2025 (Phase 2)
 * - Replaced duplicate extraction logic with entu-helpers
 * - Added TypeScript types throughout
 * - Reduced code by ~50 lines using battle-tested helpers
 */

import type { EntuTask } from '~~/types/entu'
import type { NormalizedLocation } from '~~/types/location'
import { buildResponsesByTaskQuery } from '~~/utils/entu-query-builders'

interface PermissionCheckResult {
  hasPermission: boolean
  error: string | null
}

interface Coordinates {
  lat: number
  lng: number
}

interface GeolocationCoords {
  latitude: number
  longitude: number
  accuracy: number
}

interface TaskInitOptions {
  // Constitutional: Form ref type is unknown - it's an optional external component reference
  // Could be FormInst from Naive UI but not required to type strictly here
  // Principle I: Type Safety First - documented exception for optional component ref
  responseFormRef?: unknown
  getCurrentLocation?: (ref?: unknown) => Promise<void>
  needsLocation?: { value: boolean }
  checkPermissions?: (taskId: string) => Promise<void>
  loadTaskLocations?: () => Promise<void>
  resetState?: () => void
}

interface TaskInitResult {
  success: boolean
  reason?: string
  hasExistingResponse?: boolean
  // Constitutional: Response can be either an Entu entity (from old API) or UserResponseData (from new API)
  // This is a transition type during migration - will be cleaned up when old endpoints are removed
  // Principle I: Type Safety First - documented transition state
  response?: unknown
  authenticated?: boolean
  // Constitutional: Error type is unknown - we catch and validate errors at boundaries
  // Principle I: Type Safety First - documented exception for error handling
  error?: unknown
}

export const useTaskDetail = () => {
  const log = useClientLogger('useTaskDetail')
  const { t } = useI18n()

  /**
   * Check if user has permission to access a task
   */
  const checkTaskPermissions = async (taskId: string): Promise<PermissionCheckResult> => {
    const { token, user } = useEntuAuth()
    const { getEntity } = useEntuApi()

    if (!token.value) {
      return { hasPermission: false, error: 'Not authenticated' }
    }

    try {
      // Client-side permission check (F015 migration)
      const taskResponse = await getEntity(taskId)

      if (!taskResponse) {
        return { hasPermission: false, error: 'Task not found' }
      }

      // Entu returns entities wrapped in an 'entity' property
      const task = taskResponse.entity || taskResponse

      // Additional check: if entity exists but has no data, it might not be a valid task
      if (!task || !task._id) {
        return { hasPermission: false, error: 'Invalid task entity' }
      }

      // Check if user is in any of the permission arrays
      const permissionArrays = [
        task._owner || [],
        task._editor || [],
        task._expander || []
      ]

      for (const permissionArray of permissionArrays) {
        if (Array.isArray(permissionArray)) {
          const userId = user.value?._id
          // Constitutional: Permission objects from Entu API have dynamic structure
          // We validate the properties we need (reference) at this boundary
          // Principle I: Type Safety First - documented exception for external API data
          const hasPermission = permissionArray.some((permission: unknown) =>
            typeof permission === 'object'
            && permission !== null
            && 'reference' in permission
            && permission.reference === userId
          )
          if (hasPermission) {
            return { hasPermission: true, error: null }
          }
        }
      }

      return { hasPermission: false, error: null }
    }
    catch (error) {
      return {
        hasPermission: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Parse coordinate string into lat/lng object
   */
  const parseCoordinates = (coordString: string | null | undefined): Coordinates | null => {
    if (!coordString || typeof coordString !== 'string') return null

    try {
      const parts = coordString.split(',').map((s) => s.trim())
      if (parts.length !== 2) return null

      const lat = parseFloat(parts[0]!)
      const lng = parseFloat(parts[1]!)

      if (isNaN(lat) || isNaN(lng)) return null
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

      return { lat, lng }
    }
    catch {
      return null
    }
  }

  /**
   * Get current position using browser geolocation API
   */
  const getCurrentPosition = (): Promise<GeolocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t('taskDetail.geolocationNotSupported')))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeolocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          resolve(coords)
        },
        (error) => {
          let errorMessage = t('taskDetail.geolocationError', { error: error.message })

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied geolocation permission'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }

          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  /**
   * Extract map ID from task
   * Uses standard Entu format: kaart is an array of EntuReferenceProperty
   */
  const extractMapId = (task: EntuTask): string | null => {
    return task.kaart?.[0]?.reference || null
  }

  /**
   * Load locations for a task's map
   */
  const loadTaskLocations = async (
    task: EntuTask,
    userPosition: Coordinates | null
  ): Promise<NormalizedLocation[]> => {
    try {
      const { loadMapLocations, sortByDistance } = useLocation()

      // Extract map ID from task using type-safe helper
      const mapId = extractMapId(task)

      if (!mapId) {
        log.warn('No map ID found for task')
        return []
      }

      const locations = await loadMapLocations(mapId)

      // Sort by distance if we have user position
      // Note: Coordinates type is compatible with UserPosition (has required lat/lng)
      const processedLocations = sortByDistance(locations, userPosition) as NormalizedLocation[]

      return processedLocations
    }
    catch (error) {
      log.error('Error loading task locations:', error)
      return []
    }
  }

  /**
   * Load existing response data for a task
   * @deprecated This uses old server endpoint, consider migrating to client-side
   */
  const loadExistingResponse = async (taskId: string): Promise<unknown | null> => {
    if (!taskId) return null

    try {
      const { token } = useEntuAuth()
      if (!token.value) return null

      // Constitutional: API response structure is dynamic and in transition
      // Using unknown until full migration to typed responses is complete
      // Principle I: Type Safety First - documented transition state
      const response: unknown = await $fetch(`/api/tasks/${taskId}/response`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      // Type guard to check response structure
      if (
        typeof response === 'object'
        && response !== null
        && 'success' in response
        && response.success
        && 'response' in response
      ) {
        return response.response
      }
      return null
    }
    catch (error) {
      log.warn('Failed to load existing response:', error)
      return null
    }
  }

  /**
   * Try to load existing response for a task by the current user
   */
  const findUserResponse = async (taskId: string): Promise<unknown | null> => {
    const { user } = useEntuAuth()
    const { searchEntities } = useEntuApi()

    const query = buildResponsesByTaskQuery(taskId, undefined, 1)
    query['_owner._id'] = user.value?._id

    const responses = await searchEntities(query)
    return responses.entities?.[0] ?? null
  }

  /**
   * Handle task selection and initialization
   */
  const initializeTask = async (task: EntuTask | null, options: TaskInitOptions = {}): Promise<TaskInitResult> => {
    const {
      responseFormRef,
      getCurrentLocation,
      needsLocation,
      checkPermissions,
      loadTaskLocations: loadLocations,
      resetState
    } = options

    if (!task) {
      resetState?.()
      return { success: false, reason: 'no_task' }
    }

    if (!task._id) return { success: false, reason: 'no_task_id' }

    try {
      const { token } = useEntuAuth()

      if (checkPermissions) await checkPermissions(task._id)
      if (loadLocations) await loadLocations()

      if (!token.value) {
        log.debug('Not authenticated')
        return { success: true, authenticated: false }
      }

      // Try to find existing response
      try {
        const existingResponse = await findUserResponse(task._id)
        if (existingResponse) {
          return { success: true, hasExistingResponse: true, response: existingResponse }
        }
      }
      catch (error) {
        log.debug('No existing response found or error loading:', error)
      }

      // No existing response — handle auto-geolocation
      await handleAutoGeolocation(needsLocation, getCurrentLocation, responseFormRef)
      return { success: true, hasExistingResponse: false }
    }
    catch (error) {
      log.error('Error initializing task:', error)
      return { success: false, error }
    }
  }

  /**
   * Handle auto-geolocation for tasks that need location
   */
  const handleAutoGeolocation = async (
    needsLocation: { value: boolean } | undefined,
    getCurrentLocation: ((ref?: unknown) => Promise<void>) | undefined,
    responseFormRef: unknown
  ): Promise<void> => {
    if (needsLocation?.value && getCurrentLocation) {
      try {
        await getCurrentLocation(responseFormRef)
      }
      catch (error) {
        log.debug('Auto-geolocation failed:', error)
        // Continue without location - user can set manually
      }
    }
  }

  return {
    // Permission checking
    checkTaskPermissions,

    // Location utilities
    parseCoordinates,
    getCurrentPosition,
    loadTaskLocations,

    // Response management
    loadExistingResponse,

    // Task initialization
    initializeTask,
    handleAutoGeolocation
  }
}
