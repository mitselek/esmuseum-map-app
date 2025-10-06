/**
 * Task Geolocation Management Composable
 * Simplified to use centralized GPS service for location sorting
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * User position with coordinates and accuracy
 */
export interface UserPosition {
  lat: number
  lng: number
  accuracy?: number
}

/**
 * Task location with Entu entity structure
 */
export interface TaskLocation {
  _id: string
  'name.string'?: string
  'lat.number'?: number
  'long.number'?: number
  distance?: number
  [key: string]: any
}

/**
 * Response form reference with location setter
 */
export interface ResponseFormRef {
  setLocation: (coordinates: string) => void
}

/**
 * Coordinates input (string format or object format)
 */
export interface CoordinatesObject {
  latitude: number
  longitude: number
}

export type CoordinatesInput = string | CoordinatesObject

/**
 * Return type of useTaskGeolocation composable
 */
export interface UseTaskGeolocationReturn {
  // State
  geolocationLoading: ComputedRef<boolean>
  geolocationError: ComputedRef<string | null>
  userLocation: ComputedRef<UserPosition | null>

  // Methods
  onRequestLocation: (taskLocations: Ref<TaskLocation[]>) => Promise<void>
  setFormLocation: (responseFormRef: Ref<ResponseFormRef | null>, coordinates: CoordinatesInput) => void
  watchPosition: (
    userPosition: ComputedRef<UserPosition | null>,
    taskLocations: Ref<TaskLocation[]>,
    sortByDistance: (locations: TaskLocation[], position: UserPosition) => TaskLocation[]
  ) => void
}

// ============================================================================
// Composable
// ============================================================================

export const useTaskGeolocation = (): UseTaskGeolocationReturn => {
  const { userPosition: gpsPosition, gettingLocation, locationError, sortByDistance } = useLocation()

  // Type-safe wrapper for sortByDistance (now from useLocation.ts)
  // Note: Using 'as any' because sortByDistance returns LocationEntity[] | LocationWithDistance[]
  // but we need TaskLocation[] for this composable. This is a JS boundary cast wrapping
  // the untyped utils/distance.js function. The cast is safe because TaskLocation and
  // LocationEntity are structurally compatible for distance sorting purposes.
  const sortByDistanceSafe = (locations: TaskLocation[], position: UserPosition): TaskLocation[] => {
    return (sortByDistance as any)(locations, position) as TaskLocation[]
  }

  // Re-export centralized GPS state
  const geolocationLoading = computed(() => gettingLocation.value)
  const geolocationError = computed(() => locationError.value)
  const userLocation = computed(() => gpsPosition.value)

  /**
   * Handle location request (simplified - just triggers re-sorting)
   */
  const onRequestLocation = async (taskLocations: Ref<TaskLocation[]>): Promise<void> => {
    try {
      // GPS is automatically managed by centralized service
      // Just re-sort locations if we have them and user position
      const currentPosition = gpsPosition.value
      if (taskLocations.value?.length > 0 && currentPosition) {
        taskLocations.value = sortByDistanceSafe(taskLocations.value, currentPosition)
      }
    }
    catch (err) {
      console.error('Error in location request:', err)
    }
  }

  /**
   * Set coordinates in response form
   */
  const setFormLocation = (
    responseFormRef: Ref<ResponseFormRef | null>,
    coordinates: CoordinatesInput
  ): void => {
    if (responseFormRef.value && coordinates) {
      if (typeof coordinates === 'object' && coordinates.latitude && coordinates.longitude) {
        responseFormRef.value.setLocation(`${coordinates.latitude.toFixed(6)},${coordinates.longitude.toFixed(6)}`)
      }
      else if (typeof coordinates === 'string') {
        responseFormRef.value.setLocation(coordinates)
      }
    }
  }

  /**
   * Watch for position changes and update locations
   */
  const watchPosition = (
    userPosition: ComputedRef<UserPosition | null>,
    taskLocations: Ref<TaskLocation[]>,
    sortByDistance: (locations: TaskLocation[], position: UserPosition) => TaskLocation[]
  ): void => {
    watch(userPosition, (newPosition, oldPosition) => {
      if (newPosition && newPosition.lat !== undefined && newPosition.lng !== undefined && taskLocations.value.length > 0) {
        // Check if position actually changed to avoid unnecessary updates
        const positionChanged = !oldPosition
          || !oldPosition.lat
          || !oldPosition.lng
          || oldPosition.lat !== newPosition.lat
          || oldPosition.lng !== newPosition.lng

        if (positionChanged) {
          // Re-sort existing locations with updated distances
          taskLocations.value = sortByDistance(taskLocations.value, newPosition)
        }
      }
    }, { deep: true })
  }

  return {
    // State
    geolocationLoading,
    geolocationError,
    userLocation,

    // Methods
    onRequestLocation,
    setFormLocation,
    watchPosition
  }
}
