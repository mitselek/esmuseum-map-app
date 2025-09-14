/**
 * Task Geolocation Management Composable
 * Simplified to use centralized GPS service and handle manual coordinate override
 */
export const useTaskGeolocation = () => {
  const { userPosition: gpsPosition, gettingLocation, locationError, sortByDistance } = useLocation()

  // Manual coordinates state
  const showManualCoordinates = ref(false)
  const manualCoordinates = ref('')
  const hasManualOverride = ref(false)

  // Task-specific position that can be overridden (separate from global GPS)
  const taskUserPosition = ref(null)

  // Re-export centralized GPS state
  const geolocationLoading = computed(() => gettingLocation.value)
  const geolocationError = computed(() => locationError.value)
  const userLocation = computed(() => gpsPosition.value)

  // Effective user position for this task (manual override or GPS)
  const userPosition = computed(() => {
    return hasManualOverride.value ? taskUserPosition.value : gpsPosition.value
  })

  // Handle location request (simplified - just triggers re-sorting)
  const onRequestLocation = async (taskLocations) => {
    try {
      // GPS is automatically managed by centralized service
      // Just re-sort locations if we have them and user position
      if (taskLocations.value?.length > 0 && userPosition.value) {
        taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
      }
    }
    catch (err) {
      console.error('Error in location request:', err)
    }
  }

  // Location Override Management
  const handleLocationChange = (coordinates, taskLocations) => {
    if (coordinates) {
      // Apply manual coordinates to task-specific position (don't mutate global GPS!)
      const parts = coordinates.split(',').map((s) => s.trim())
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])

      if (!isNaN(lat) && !isNaN(lng)) {
        taskUserPosition.value = { lat, lng, accuracy: null, manual: true }
        hasManualOverride.value = true
        manualCoordinates.value = coordinates

        // Re-sort locations with new position
        if (taskLocations.value?.length > 0) {
          taskLocations.value = sortByDistance(taskLocations.value, taskUserPosition.value)
        }
      }
    }
    else {
      // Clear manual override - revert to GPS position
      hasManualOverride.value = false
      manualCoordinates.value = ''
      taskUserPosition.value = null

      // Re-sort locations with GPS position if available
      if (taskLocations.value?.length > 0 && gpsPosition.value) {
        taskLocations.value = sortByDistance(taskLocations.value, gpsPosition.value)
      }
    }
  }

  // Set coordinates in response form
  const setFormLocation = (responseFormRef, coordinates) => {
    if (responseFormRef.value && coordinates) {
      if (typeof coordinates === 'object' && coordinates.latitude && coordinates.longitude) {
        responseFormRef.value.setLocation(`${coordinates.latitude.toFixed(6)},${coordinates.longitude.toFixed(6)}`)
      }
      else if (typeof coordinates === 'string') {
        responseFormRef.value.setLocation(coordinates)
      }
    }
  }

  // Watch for position changes and update locations
  const watchPosition = (userPosition, taskLocations, sortByDistance) => {
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
    showManualCoordinates,
    manualCoordinates,
    hasManualOverride,

    // Methods
    onRequestLocation,
    handleLocationChange,
    setFormLocation,
    watchPosition
  }
}
