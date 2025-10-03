/**
 * Centralized Geolocation Service
 * Handles GPS location requests with caching, deduplication, and automatic updates
 */

import { ENTU_TYPES, ENTU_PROPERTIES } from '../constants/entu'
import { getCurrentPosition, sortLocationsByDistance } from '../utils/distance'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * User's GPS position with accuracy
 */
interface UserPosition {
  lat: number
  lng: number
  accuracy?: number
}

/**
 * Geolocation permission state
 * - 'granted': User has granted permission
 * - 'denied': User has denied permission
 * - 'prompt': Permission needs to be requested
 * - 'unknown': Permission state cannot be determined (mobile browsers)
 */
type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown'

/**
 * Geolocation API options
 */
interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

/**
 * Normalized coordinates (simple lat/lng format)
 */
interface NormalizedCoordinates {
  lat: number
  lng: number
}

/**
 * Entu location entity (from API response)
 */
interface LocationEntity {
  _id: string
  name?: Array<{ string: string }>
  lat?: Array<{ number: number }>
  long?: Array<{ number: number }>
  description?: string
  kirjeldus?: Array<{ string: string }>
  properties?: {
    name?: Array<{ value: string }>
    nimi?: Array<{ value: string }>
    lat?: Array<{ value: number; number: number; string: string }>
    long?: Array<{ value: number; number: number; string: string }>
    description?: Array<{ value: string }>
    kirjeldus?: Array<{ value: string }>
  }
  coordinates?: NormalizedCoordinates
  distance?: number
  distanceText?: string
}

/**
 * Location with distance information (after sorting)
 */
interface LocationWithDistance extends LocationEntity {
  distance: number
  distanceText: string
  coordinates: NormalizedCoordinates
}

/**
 * Map reference from task (can be string or object)
 */
type MapReference = string | { reference?: string; _id?: string; id?: string } | null | undefined

/**
 * Task with optional map reference
 */
interface TaskWithMap {
  kaart?: MapReference | Array<{ reference: string }>
  entity?: {
    properties?: {
      kaart?: Array<{ reference: string }>
    }
    kaart?: Array<{ reference: string }>
  }
}

/**
 * Composable return type
 */
interface UseLocationReturn {
  // State
  userPosition: Ref<UserPosition | null>
  gettingLocation: Ref<boolean>
  locationError: Ref<string | null>
  showGPSPrompt: Ref<boolean>
  permissionDenied: Ref<boolean>

  // Core GPS methods
  getUserPosition: (forceUpdate?: boolean, options?: GeolocationOptions) => Promise<UserPosition>
  initializeGPS: () => Promise<void>
  initializeGPSWithPermissionCheck: () => Promise<void>
  checkGeolocationPermission: () => Promise<PermissionState>
  setManualOverride: (isManual: boolean) => void
  stopGPSUpdates: () => void
  requestGPSPermission: () => void
  dismissGPSPrompt: () => void

  // Location data methods
  loadMapLocations: (mapId: string) => Promise<LocationEntity[]>
  loadTaskLocations: (task: TaskWithMap) => Promise<LocationEntity[]>
  sortByDistance: (locations: LocationEntity[], position?: UserPosition | null) => LocationEntity[] | LocationWithDistance[]
  getSortedLocations: (locations: LocationEntity[]) => ComputedRef<LocationEntity[] | LocationWithDistance[]>
  formatCoordinates: (coordinates: string | NormalizedCoordinates | null) => string
  getLocationCoordinates: (location: LocationEntity) => string
  getLocationName: (location: LocationEntity) => string
  getLocationDescription: (location: LocationEntity) => string | null
  clearUserPosition: () => void
}

// ============================================================================
// Global State (Singleton Pattern)
// ============================================================================

// Global state shared across all component instances
const globalUserPosition = ref<UserPosition | null>(null)
const globalGettingLocation = ref<boolean>(false)
const globalLocationError = ref<string | null>(null)
const globalLastRequestTime = ref<number | null>(null)
const globalManualOverride = ref<boolean>(false)
const globalShowGPSPrompt = ref<boolean>(false) // Start hidden, will show based on permission check
const globalPermissionDenied = ref<boolean>(false)
let globalUpdateInterval: ReturnType<typeof setInterval> | null = null
let globalPendingRequest: Promise<UserPosition> | null = null

// ============================================================================
// Composable
// ============================================================================

export const useLocation = (): UseLocationReturn => {
  // Use global state for shared location data
  const userPosition = globalUserPosition
  const gettingLocation = globalGettingLocation
  const locationError = globalLocationError
  const showGPSPrompt = globalShowGPSPrompt
  const permissionDenied = globalPermissionDenied

  // Start automatic GPS updates (30 seconds)
  const startGPSUpdates = (): void => {
    if (globalUpdateInterval) return // Already running

    globalUpdateInterval = setInterval(() => {
      // Skip updates if manual override is active
      if (globalManualOverride.value) {
        return
      }

      // Refresh GPS position
      getUserPosition(true) // forceUpdate = true
    }, 30000) // 30 seconds
  }

  // Stop automatic GPS updates
  const stopGPSUpdates = (): void => {
    if (globalUpdateInterval) {
      clearInterval(globalUpdateInterval)
      globalUpdateInterval = null
    }
  }

  // Check current geolocation permission status
  const checkGeolocationPermission = async (): Promise<PermissionState> => {
    try {
      if (!navigator.permissions) {
        console.log('🔍 [EVENT] useLocation - navigator.permissions not available')
        return 'unknown'
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' })
      console.log('🔍 [EVENT] useLocation - Permission query result:', {
        state: permission.state,
        userAgent: navigator.userAgent.includes('iPhone') ? 'iOS' : 'Other'
      })

      // MOBILE BROWSER FIX: Permission API can be unreliable on mobile
      // If it says "prompt" but we suspect permission was actually denied,
      // let's do a quick test of the actual geolocation API
      if (permission.state === 'prompt' && navigator.userAgent.includes('iPhone')) {
        console.log('🔍 [EVENT] useLocation - iOS detected, testing actual geolocation behavior...')

        try {
          // Quick test - try to get position with very short timeout
          await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { timeout: 100, maximumAge: Infinity } // Use any cached position
            )
          })
          console.log('🔍 [EVENT] useLocation - Geolocation test: appears to be granted')
          return 'granted'
        }
        catch (testError) {
          if ((testError as GeolocationPositionError).code === 1) { // PERMISSION_DENIED
            console.log('🔍 [EVENT] useLocation - Geolocation test: actually denied (permission API lied)')
            return 'denied'
          }
          console.log('🔍 [EVENT] useLocation - Geolocation test: other error, treating as prompt')
          return 'prompt'
        }
      }

      return permission.state as PermissionState // 'granted', 'denied', or 'prompt'
    }
    catch (error) {
      console.warn('Could not check geolocation permission:', error)
      // On mobile browsers, especially iOS, permission API might fail
      // Default to 'unknown' which will show the prompt
      return 'unknown'
    }
  }

  // Initialize GPS based on current permission state
  const initializeGPSWithPermissionCheck = async (): Promise<void> => {
    // 🔍 EVENT TRACKING: GPS initialization timing
    const startTime = performance.now()
    console.log('🌍 [EVENT] useLocation - GPS initialization started')

    const permissionState = await checkGeolocationPermission()

    switch (permissionState) {
      case 'granted':
        console.log('🌍 [EVENT] useLocation - Permission granted, getting position...')
        globalShowGPSPrompt.value = false
        globalPermissionDenied.value = false
        await getUserPosition()
        startGPSUpdates()
        break

      case 'denied':
        console.log('🌍 [EVENT] useLocation - Permission denied by user')
        globalShowGPSPrompt.value = false
        globalPermissionDenied.value = true
        break

      case 'prompt':
      case 'unknown':
      default:
        console.log('🌍 [EVENT] useLocation - Permission prompt required')
        globalShowGPSPrompt.value = true
        globalPermissionDenied.value = false
        console.log('🔍 [EVENT] useLocation - GPS prompt state after setting:', {
          showGPSPrompt: globalShowGPSPrompt.value,
          permissionState,
          userAgent: navigator.userAgent.includes('iPhone') ? 'iOS' : 'Other'
        })
        break
    }

    // Monitor permission changes
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        permission.addEventListener('change', () => {
          // Re-initialize based on new permission state
          initializeGPSWithPermissionCheck()
        })
      }
    }
    catch (error) {
      console.warn('Could not monitor permission changes:', error)
    }

    // 🔍 SAFETY CHECK: Ensure GPS prompt shows if no location and not denied
    setTimeout(() => {
      console.log('🔍 [EVENT] useLocation - Safety check after initialization:', {
        hasUserPosition: !!globalUserPosition.value,
        showGPSPrompt: globalShowGPSPrompt.value,
        permissionDenied: globalPermissionDenied.value,
        permissionState
      })

      // If we don't have a position, permission isn't denied, and prompt isn't showing, force it
      if (!globalUserPosition.value && !globalPermissionDenied.value && !globalShowGPSPrompt.value) {
        console.log('🌍 [EVENT] useLocation - SAFETY: Forcing GPS prompt to show')
        globalShowGPSPrompt.value = true
      }
    }, 500) // Small delay to allow permission state to settle
  }

  // Set manual override state (pauses automatic updates)
  const setManualOverride = (isManual: boolean): void => {
    globalManualOverride.value = isManual
  }

  // Request GPS permission (triggered by user action)
  const requestGPSPermission = (): void => {
    console.log('🌍 [EVENT] useLocation - requestGPSPermission called', {
      currentShowPrompt: globalShowGPSPrompt.value,
      currentPermissionDenied: globalPermissionDenied.value,
      currentUserPosition: globalUserPosition.value,
      userAgent: navigator.userAgent.includes('iPhone') ? 'iOS' : 'Other'
    })

    globalShowGPSPrompt.value = false

    // For mobile, we need to call geolocation API DIRECTLY in user gesture context
    // Don't delegate to getUserPosition which might lose gesture context
    if (!navigator.geolocation) {
      console.log('🌍 [EVENT] useLocation - Geolocation not available')
      globalPermissionDenied.value = true
      return
    }

    console.log('🌍 [EVENT] useLocation - Calling navigator.geolocation.getCurrentPosition directly')

    // Call native API directly within user gesture
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        console.log('🌍 [EVENT] useLocation - Native GPS success', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })

        // Update global state
        globalUserPosition.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        globalLastRequestTime.value = Date.now()
        globalPermissionDenied.value = false
        globalGettingLocation.value = false

        // Start continuous updates
        startGPSUpdates()
      },
      (error: GeolocationPositionError) => {
        console.log('🌍 [EVENT] useLocation - Native GPS failed', {
          error: error.message,
          code: error.code,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        })

        globalPermissionDenied.value = true
        globalGettingLocation.value = false
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Longer timeout for mobile
        maximumAge: 0 // Always get fresh position
      }
    )

    // Set loading state
    globalGettingLocation.value = true
  }

  // Dismiss GPS prompt without requesting
  const dismissGPSPrompt = (): void => {
    console.log('🌍 [EVENT] useLocation - GPS prompt dismissed by user')
    globalShowGPSPrompt.value = false
    globalPermissionDenied.value = true
  }

  // Get user's current position with caching and deduplication
  const getUserPosition = async (forceUpdate = false, options: GeolocationOptions = {}): Promise<UserPosition> => {
    // Return cached position if available and not forcing update
    if (!forceUpdate && globalUserPosition.value && globalLastRequestTime.value) {
      return globalUserPosition.value
    }

    // If there's already a pending request, return that promise
    if (globalPendingRequest) {
      return globalPendingRequest
    }

    // Create new GPS request
    globalPendingRequest = (async (): Promise<UserPosition> => {
      globalGettingLocation.value = true
      globalLocationError.value = null

      try {
        const position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Always get fresh position
          ...options
        }) as UserPosition

        // Only update if position has changed significantly
        const hasSignificantChange = !globalUserPosition.value
          || Math.abs(globalUserPosition.value.lat - position.lat) > 0.0001 // ~10 meters
          || Math.abs(globalUserPosition.value.lng - position.lng) > 0.0001

        if (hasSignificantChange) {
          globalUserPosition.value = position
          globalLastRequestTime.value = Date.now()
        }
        else {
          globalLastRequestTime.value = Date.now() // Update timestamp even if position unchanged
        }

        // Guaranteed to be non-null at this point
        return globalUserPosition.value!
      }
      catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        globalLocationError.value = errorMessage
        console.error('Error getting GPS position:', error)
        throw error
      }
      finally {
        globalGettingLocation.value = false
        globalPendingRequest = null
      }
    })()

    return globalPendingRequest
  }

  // Auto-request GPS position when service is first used
  const initializeGPS = async (): Promise<void> => {
    try {
      await getUserPosition()
      startGPSUpdates()
    }
    catch {
      // Still start updates for future attempts
      startGPSUpdates()
    }
  }

  // Load locations for a specific map
  const loadMapLocations = async (mapId: string): Promise<LocationEntity[]> => {
    if (!mapId) {
      throw new Error('Map ID is required')
    }

    // Validate map ID format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(mapId)) {
      throw new Error('Invalid map ID format')
    }

    const { searchEntities } = useEntuApi()

    try {
      // Search for locations that belong to this map using direct Entu API call
      const searchResult = await searchEntities({
        [ENTU_PROPERTIES.TYPE_STRING]: ENTU_TYPES.LOCATION,
        '_parent.reference': mapId,
        limit: 10000,
        props: `${ENTU_PROPERTIES.NAME_STRING},${ENTU_PROPERTIES.LAT_NUMBER},${ENTU_PROPERTIES.LONG_NUMBER},${ENTU_PROPERTIES.KIRJELDUS_STRING}`
      })

      const rawLocations = (searchResult?.entities || []) as LocationEntity[]

      // Normalize coordinates at API boundary - convert from Entu's nested format to simple {lat, lng}
      const locations = rawLocations.map((location) => {
        const normalizedLocation: LocationEntity = { ...location }

        // Extract coordinates from Entu's nested format and create normalized coordinates
        if (location.lat?.[0]?.number != null && location.long?.[0]?.number != null) {
          normalizedLocation.coordinates = {
            lat: location.lat[0].number,
            lng: location.long[0].number
          }
        }

        return normalizedLocation
      })

      console.log(`[CLIENT] Loaded ${locations.length} locations for map ${mapId}`, {
        requestedLimit: 10000,
        actualCount: locations.length,
        searchResultCount: searchResult?.count,
        optimizedWithProps: true,
        normalizedCoordinates: true
      })

      return locations
    }
    catch (error) {
      console.error('Error loading map locations (client-side):', error)
      throw new Error('Asukohtade laadimine ebaõnnestus')
    }
  }

  // Load task's map and its locations
  const loadTaskLocations = async (task: TaskWithMap): Promise<LocationEntity[]> => {
    if (!task) {
      throw new Error('Task is required')
    }

    // Get map reference from task - check multiple possible locations
    let mapReference: string | undefined

    // Check if kaart is an array with reference
    if (Array.isArray(task.kaart) && task.kaart[0]?.reference) {
      mapReference = task.kaart[0].reference
    }
    // Check entity.properties.kaart
    else if (Array.isArray(task.entity?.properties?.kaart) && task.entity.properties.kaart[0]?.reference) {
      mapReference = task.entity.properties.kaart[0].reference
    }
    // Check entity.kaart
    else if (Array.isArray(task.entity?.kaart) && task.entity.kaart[0]?.reference) {
      mapReference = task.entity.kaart[0].reference
    }
    // Check if kaart is directly a string
    else if (typeof task.kaart === 'string') {
      mapReference = task.kaart
    }
    // Check if kaart is an object with reference/_id/id
    else if (task.kaart && typeof task.kaart === 'object' && !Array.isArray(task.kaart)) {
      mapReference = task.kaart.reference || task.kaart._id || task.kaart.id
    }

    if (!mapReference) {
      return []
    }

    return await loadMapLocations(mapReference)
  }

  // Sort locations by distance from user
  const sortByDistance = (locations: LocationEntity[], position: UserPosition | null = null): LocationEntity[] | LocationWithDistance[] => {
    const pos = position || userPosition.value

    // Cast to any at JS boundary (sortLocationsByDistance is JS)
    // Pass null explicitly if no position (sortLocationsByDistance handles this)
    const result = sortLocationsByDistance(locations, pos || null as any) as LocationEntity[] | LocationWithDistance[]
    return result
  }

  // Get sorted locations with distance info
  const getSortedLocations = (locations: LocationEntity[]): ComputedRef<LocationEntity[] | LocationWithDistance[]> => {
    return computed(() => {
      return sortByDistance(locations, userPosition.value)
    })
  }

  // Format coordinates for display
  const formatCoordinates = (coordinates: string | NormalizedCoordinates | null): string => {
    if (!coordinates) return ''

    if (typeof coordinates === 'string') {
      const parts = coordinates.split(',').map((c) => c.trim())
      if (parts.length === 2 && parts[0] && parts[1]) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        if (!isNaN(lat) && !isNaN(lng)) {
          return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }
      }
      return ''
    }

    if (coordinates.lat != null && coordinates.lng != null) {
      return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
    }

    return ''
  }

  // Convert location to coordinate string
  const getLocationCoordinates = (location: LocationEntity): string => {
    if (!location) {
      return ''
    }

    // If coordinates were already calculated by sortLocationsByDistance
    if (location.coordinates?.lat != null && location.coordinates?.lng != null) {
      return `${location.coordinates.lat},${location.coordinates.lng}`
    }

    // Try to extract from separate lat/long fields (various formats)
    const lat = location.lat?.[0]?.number
      ?? location.properties?.lat?.[0]?.value
      ?? location.properties?.lat?.[0]?.number

    const lng = location.long?.[0]?.number
      ?? location.properties?.long?.[0]?.value
      ?? location.properties?.long?.[0]?.number

    if (lat != null && lng != null) {
      return `${lat},${lng}`
    }

    return ''
  }

  // Extract location name for display
  const getLocationName = (location: LocationEntity): string => {
    return location.name?.[0]?.string
      || location.properties?.name?.[0]?.value
      || location.properties?.nimi?.[0]?.value
      || (typeof location.name === 'string' ? location.name : null)
      || 'Nimetu asukoht'
  }

  // Extract location description
  const getLocationDescription = (location: LocationEntity): string | null => {
    return location.properties?.description?.[0]?.value
      || location.properties?.kirjeldus?.[0]?.value
      || (typeof location.description === 'string' ? location.description : null)
      || null
  }

  // Clear user position and stop updates
  const clearUserPosition = (): void => {
    globalUserPosition.value = null
    globalLocationError.value = null
    globalLastRequestTime.value = null
    stopGPSUpdates()
  }

  return {
    // State
    userPosition,
    gettingLocation,
    locationError,
    showGPSPrompt,
    permissionDenied,

    // Core GPS methods
    getUserPosition,
    initializeGPS,
    initializeGPSWithPermissionCheck,
    checkGeolocationPermission,
    setManualOverride,
    stopGPSUpdates,
    requestGPSPermission,
    dismissGPSPrompt,

    // Location data methods
    loadMapLocations,
    loadTaskLocations,
    sortByDistance,
    getSortedLocations,
    formatCoordinates,
    getLocationCoordinates,
    getLocationName,
    getLocationDescription,
    clearUserPosition
  }
}
