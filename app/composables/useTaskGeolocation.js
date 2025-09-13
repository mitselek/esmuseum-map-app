/**
 * Task Geolocation Management Composable
 * Handles GPS location detection, manual coordinate override, and position management
 */
export const useTaskGeolocation = () => {
  const { t } = useI18n()
  const { userPosition, sortByDistance } = useLocation()

  // Geolocation state
  const geolocationLoading = ref(false)
  const geolocationError = ref(null)
  const userLocation = ref(null)

  // Manual coordinates state
  const showManualCoordinates = ref(false)
  const manualCoordinates = ref('')
  const hasManualOverride = ref(false)

  // Get current GPS location
  const getCurrentLocation = async (responseFormRef = null) => {
    if (!navigator.geolocation) {
      geolocationError.value = t('taskDetail.geolocationNotSupported')
      return false
    }

    geolocationLoading.value = true
    geolocationError.value = null

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }

          // Save detected location separately for restoration
          userLocation.value = coords

          // Update user position (unless manually overridden)
          if (!hasManualOverride.value) {
            userPosition.value = {
              lat: coords.latitude,
              lng: coords.longitude,
              accuracy: coords.accuracy
            }
          }

          // Set the coordinates in the response form if provided
          if (responseFormRef?.value) {
            responseFormRef.value.setLocation(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`)
          }

          geolocationLoading.value = false
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

          geolocationError.value = errorMessage
          geolocationLoading.value = false
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  // Handle location request
  const onRequestLocation = async (taskLocations) => {
    try {
      geolocationLoading.value = true
      await getCurrentLocation()

      // Re-sort locations by distance if we have them
      if (taskLocations.value?.length > 0) {
        taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
      }
    }
    catch (err) {
      console.error('Error getting user position:', err)
      geolocationError.value = err.message
    }
    finally {
      geolocationLoading.value = false
    }
  }

  // Location Override Management
  const handleLocationChange = (coordinates, taskLocations) => {
    if (coordinates) {
      // Apply manual coordinates
      const parts = coordinates.split(',').map((s) => s.trim())
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])

      if (!isNaN(lat) && !isNaN(lng)) {
        userPosition.value = { lat, lng, accuracy: null, manual: true }
        hasManualOverride.value = true
        manualCoordinates.value = coordinates

        // Re-sort locations with new position
        if (taskLocations.value?.length > 0) {
          taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
        }
      }
    }
    else {
      // Clear manual override
      hasManualOverride.value = false
      manualCoordinates.value = ''

      // Reset to detected GPS position if available
      if (userLocation.value) {
        userPosition.value = {
          lat: userLocation.value.latitude,
          lng: userLocation.value.longitude,
          accuracy: userLocation.value.accuracy
        }
      }
      else {
        userPosition.value = null
      }

      // Re-sort locations
      if (taskLocations.value?.length > 0 && userPosition.value) {
        taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
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
    getCurrentLocation,
    onRequestLocation,
    handleLocationChange,
    setFormLocation,
    watchPosition
  }
}
