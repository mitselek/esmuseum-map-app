/**
 * Composable for task detail panel functionality
 *
 * MIGRATED TO TYPESCRIPT: October 3, 2025 (Phase 2)
 * - Replaced duplicate extraction logic with entu-helpers
 * - Added TypeScript types throughout
 * - Reduced code by ~50 lines using battle-tested helpers
 */

import type { EntuTask } from '../../types/entu'
import type { EntuUser } from './useEntuAuth'
import type { UserResponseData } from '../../types/workspace'
import { ENTU_TYPES } from '../constants/entu'
import {
  getTaskName,
  getTaskDescription as getTaskDescriptionHelper,
  getTaskResponseCount
} from '../../utils/entu-helpers'

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
  const { t } = useI18n()

  /**
   * Get task title using entu-helpers
   * @deprecated Use getTaskName from entu-helpers directly
   */
  const getTaskTitle = (task: EntuTask): string => {
    return getTaskName(task) || t('taskDetail.noTitle', 'Untitled Task')
  }

  /**
   * Get task description using entu-helpers
   * @deprecated Use getTaskDescription from entu-helpers directly
   */
  const getTaskDescription = (task: EntuTask): string | null => {
    return getTaskDescriptionHelper(task) || null
  }

  /**
   * Get response count using entu-helpers
   * @deprecated Use getTaskResponseCount from entu-helpers directly
   */
  const getResponseCount = (task: EntuTask): number => {
    return getTaskResponseCount(task)
  }

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
            typeof permission === 'object' &&
            permission !== null &&
            'reference' in permission &&
            permission.reference === userId
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
   * Extract coordinates from location object
   */
  const getLocationCoordinates = (location: unknown): string | null => {
    // Constitutional: Location data comes from various sources (localStorage, API, map clicks)
    // We validate the structure we need at this boundary
    // Principle I: Type Safety First - documented exception for flexible location data
    if (
      typeof location === 'object' &&
      location !== null &&
      'coordinates' in location &&
      typeof location.coordinates === 'string'
    ) {
      return location.coordinates
    }
    if (
      typeof location === 'object' &&
      location !== null &&
      'lat' in location &&
      'lng' in location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number'
    ) {
      return `${location.lat},${location.lng}`
    }
    return null
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
  ): Promise<any[]> => {
    try {
      const { loadMapLocations, sortByDistance } = useLocation()

      // Extract map ID from task using type-safe helper
      const mapId = extractMapId(task)

      if (!mapId) {
        console.warn('No map ID found for task')
        return []
      }

      const locations = await loadMapLocations(mapId)

      // Sort by distance if we have user position
      // Note: Coordinates type is compatible with UserPosition (has required lat/lng)
      const processedLocations = sortByDistance(locations, userPosition)

      return processedLocations
    }
    catch (error) {
      console.error('Error loading task locations:', error)
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
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success &&
        'response' in response
      ) {
        return response.response
      }
      return null
    }
    catch (error) {
      console.warn('Failed to load existing response:', error)
      return null
    }
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
      // No task selected, reset states
      if (resetState) {
        resetState()
      }
      return { success: false, reason: 'no_task' }
    }

    const taskId = task._id
    if (!taskId) {
      return { success: false, reason: 'no_task_id' }
    }

    try {
      const { token, user } = useEntuAuth()
      const { searchEntities } = useEntuApi()

      // Check permissions first
      if (checkPermissions) {
        await checkPermissions(taskId)
      }

      // Load task locations
      if (loadLocations) {
        await loadLocations()
      }

      // Handle authentication and response loading
      if (token.value) {
        try {
          // Client-side version (F015 migration)
          const responses = await searchEntities({
            '_type.string': ENTU_TYPES.VASTUS,
            '_parent.reference': taskId,
            '_owner._id': user.value?._id,
            limit: 1
          })

          const responseData = {
            success: true,
            response: responses.entities && responses.entities.length > 0 ? responses.entities[0] : null
          }

          if (responseData.success && responseData.response) {
            // Existing response found
            return {
              success: true,
              hasExistingResponse: true,
              response: responseData.response
            }
          }
          else {
            // No existing response - handle auto-geolocation
            await handleAutoGeolocation(needsLocation, getCurrentLocation, responseFormRef)
            return { success: true, hasExistingResponse: false }
          }
        }
        catch (error) {
          console.log('No existing response found or error loading:', error)
          // Handle auto-geolocation for new response
          await handleAutoGeolocation(needsLocation, getCurrentLocation, responseFormRef)
          return { success: true, hasExistingResponse: false }
        }
      }
      else {
        // Not authenticated
        console.log('Not authenticated')
        return { success: true, authenticated: false }
      }
    }
    catch (error) {
      console.error('Error initializing task:', error)
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
        console.log('Auto-geolocation failed:', error)
        // Continue without location - user can set manually
      }
    }
  }

  return {
    // Task data helpers (use entu-helpers directly in new code)
    getTaskTitle,
    getTaskDescription,
    getResponseCount,

    // Permission checking
    checkTaskPermissions,

    // Location utilities
    getLocationCoordinates,
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
