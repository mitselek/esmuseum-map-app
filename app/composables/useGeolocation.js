/**
 * Geolocation and GPS Management Composable
 * Handles GPS positioning, permissions, and automatic updates
 * @file useGeolocation.js
 */

// Global state shared across all component instances
const globalUserPosition = ref(null)
const globalGettingLocation = ref(false)
const globalLocationError = ref(null)
const globalLastRequestTime = ref(null)
const globalManualOverride = ref(false)
const globalShowGPSPrompt = ref(false)
const globalPermissionDenied = ref(false)
let globalUpdateInterval = null
let globalPendingRequest = null

/**
 * Geolocation management composable
 * Provides GPS positioning with caching, deduplication, and automatic updates
 */
export function useGeolocation () {
  const userPosition = globalUserPosition
  const gettingLocation = globalGettingLocation
  const locationError = globalLocationError
  const showGPSPrompt = globalShowGPSPrompt
  const permissionDenied = globalPermissionDenied

  /**
     * Start automatic GPS updates (30 seconds)
     */
  const startGPSUpdates = () => {
    if (globalUpdateInterval) return

    globalUpdateInterval = setInterval(() => {
      if (globalManualOverride.value) {
        return
      }
      getUserPosition(true)
    }, 30000)
  }

  /**
     * Stop automatic GPS updates
     */
  const stopGPSUpdates = () => {
    if (globalUpdateInterval) {
      clearInterval(globalUpdateInterval)
      globalUpdateInterval = null
    }
  }

  /**
     * Check current geolocation permission status
     */
  const checkGeolocationPermission = async () => {
    try {
      if (!navigator.permissions) {
        return 'unknown'
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state
    }
    catch (error) {
      console.warn('Could not check geolocation permission:', error)
      return 'unknown'
    }
  }

  /**
     * Initialize GPS based on current permission state
     */
  const initializeGPSWithPermissionCheck = async () => {
    const permissionState = await checkGeolocationPermission()

    switch (permissionState) {
      case 'granted':
        globalShowGPSPrompt.value = false
        globalPermissionDenied.value = false
        await getUserPosition()
        startGPSUpdates()
        break

      case 'denied':
        globalShowGPSPrompt.value = false
        globalPermissionDenied.value = true
        break

      case 'prompt':
      case 'unknown':
      default:
        globalShowGPSPrompt.value = true
        globalPermissionDenied.value = false
        break
    }

    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        permission.addEventListener('change', () => {
          initializeGPSWithPermissionCheck()
        })
      }
    }
    catch (error) {
      console.warn('Could not monitor permission changes:', error)
    }
  }

  /**
     * Set manual override state (pauses automatic updates)
     */
  const setManualOverride = (isManual) => {
    globalManualOverride.value = isManual
  }

  /**
     * Request GPS permission (triggered by user action)
     */
  const requestGPSPermission = () => {
    globalShowGPSPrompt.value = false

    getUserPosition(true).then(() => {
      globalPermissionDenied.value = false
    }).catch(() => {
      globalPermissionDenied.value = true
    })
  }

  /**
     * Dismiss GPS prompt without requesting
     */
  const dismissGPSPrompt = () => {
    globalShowGPSPrompt.value = false
    globalPermissionDenied.value = true
  }

  /**
     * Get user's current position with caching and deduplication
     */
  const getUserPosition = async (forceUpdate = false, options = {}) => {
    if (!forceUpdate && globalUserPosition.value && globalLastRequestTime.value) {
      return globalUserPosition.value
    }

    if (globalPendingRequest) {
      return globalPendingRequest
    }

    globalPendingRequest = (async () => {
      globalGettingLocation.value = true
      globalLocationError.value = null

      try {
        const position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options
        })

        const hasSignificantChange = !globalUserPosition.value
          || Math.abs(globalUserPosition.value.lat - position.lat) > 0.0001
          || Math.abs(globalUserPosition.value.lng - position.lng) > 0.0001

        if (hasSignificantChange) {
          globalUserPosition.value = position
          globalLastRequestTime.value = Date.now()
        }
        else {
          globalLastRequestTime.value = Date.now()
        }

        return globalUserPosition.value
      }
      catch (error) {
        globalLocationError.value = error.message
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

  /**
     * Auto-request GPS position when service is first used
     */
  const initializeGPS = async () => {
    try {
      await getUserPosition()
      startGPSUpdates()
    }
    catch {
      startGPSUpdates()
    }
  }

  /**
     * Clear user position and stop updates
     */
  const clearUserPosition = () => {
    globalUserPosition.value = null
    globalLocationError.value = null
    globalLastRequestTime.value = null
    stopGPSUpdates()
  }

  return {
    userPosition,
    gettingLocation,
    locationError,
    showGPSPrompt,
    permissionDenied,
    getUserPosition,
    initializeGPS,
    initializeGPSWithPermissionCheck,
    checkGeolocationPermission,
    setManualOverride,
    stopGPSUpdates,
    requestGPSPermission,
    dismissGPSPrompt,
    clearUserPosition
  }
}
