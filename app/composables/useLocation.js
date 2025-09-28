/**
 * Centralized Geolocation Service
 * Handles GPS location requests with caching, deduplication, and automatic updates
 */

// Global state shared across all component instances
const globalUserPosition = ref(null)
const globalGettingLocation = ref(false)
const globalLocationError = ref(null)
const globalLastRequestTime = ref(null)
const globalManualOverride = ref(false)
const globalShowGPSPrompt = ref(false) // Start hidden, will show based on permission check
const globalPermissionDenied = ref(false)
let globalUpdateInterval = null
let globalPendingRequest = null

export const useLocation = () => {
  // Use global state for shared location data
  const userPosition = globalUserPosition
  const gettingLocation = globalGettingLocation
  const locationError = globalLocationError
  const showGPSPrompt = globalShowGPSPrompt
  const permissionDenied = globalPermissionDenied

  // Start automatic GPS updates (30 seconds)
  const startGPSUpdates = () => {
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
  const stopGPSUpdates = () => {
    if (globalUpdateInterval) {
      clearInterval(globalUpdateInterval)
      globalUpdateInterval = null
    }
  }

  // Check current geolocation permission status
  const checkGeolocationPermission = async () => {
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
          await new Promise((resolve, reject) => {
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
          if (testError.code === 1) { // PERMISSION_DENIED
            console.log('🔍 [EVENT] useLocation - Geolocation test: actually denied (permission API lied)')
            return 'denied'
          }
          console.log('🔍 [EVENT] useLocation - Geolocation test: other error, treating as prompt')
          return 'prompt'
        }
      }

      return permission.state // 'granted', 'denied', or 'prompt'
    }
    catch (error) {
      console.warn('Could not check geolocation permission:', error)
      // On mobile browsers, especially iOS, permission API might fail
      // Default to 'unknown' which will show the prompt
      return 'unknown'
    }
  }

  // Initialize GPS based on current permission state
  const initializeGPSWithPermissionCheck = async () => {
    // 🔍 EVENT TRACKING: GPS initialization start
    const startTime = performance.now()
    console.log('🌍 [EVENT] useLocation - GPS initialization started', new Date().toISOString())
    console.log('🌍 [EVENT] useLocation - User agent:', navigator.userAgent)
    console.log('🌍 [EVENT] useLocation - Geolocation available:', !!navigator.geolocation)
    console.log('🌍 [EVENT] useLocation - HTTPS check:', location.protocol === 'https:')
    console.log('🌍 [EVENT] useLocation - Current host:', location.hostname)

    const permissionState = await checkGeolocationPermission()
    console.log('🔍 [EVENT] useLocation - Permission state:', permissionState)
    console.log('🔍 [EVENT] useLocation - Current GPS states:', {
      showGPSPrompt: globalShowGPSPrompt.value,
      permissionDenied: globalPermissionDenied.value,
      userPosition: !!globalUserPosition.value
    })

    switch (permissionState) {
      case 'granted':
        console.log('🌍 [EVENT] useLocation - Permission granted, getting position...')
        globalShowGPSPrompt.value = false
        globalPermissionDenied.value = false
        await getUserPosition()
        startGPSUpdates()
        console.log('🌍 [EVENT] useLocation - GPS initialization completed (granted)', `${(performance.now() - startTime).toFixed(2)}ms`)
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
  const setManualOverride = (isManual) => {
    globalManualOverride.value = isManual
  }

  // Request GPS permission (triggered by user action)
  const requestGPSPermission = () => {
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
      (position) => {
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
      (error) => {
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
  const dismissGPSPrompt = () => {
    console.log('🌍 [EVENT] useLocation - GPS prompt dismissed by user')
    globalShowGPSPrompt.value = false
    globalPermissionDenied.value = true
  }

  // Get user's current position with caching and deduplication
  const getUserPosition = async (forceUpdate = false, options = {}) => {
    // Return cached position if available and not forcing update
    if (!forceUpdate && globalUserPosition.value && globalLastRequestTime.value) {
      return globalUserPosition.value
    }

    // If there's already a pending request, return that promise
    if (globalPendingRequest) {
      return globalPendingRequest
    }

    // Create new GPS request
    globalPendingRequest = (async () => {
      globalGettingLocation.value = true
      globalLocationError.value = null

      try {
        const position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Always get fresh position
          ...options
        })

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

  // Auto-request GPS position when service is first used
  const initializeGPS = async () => {
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
  const loadMapLocations = async (mapId) => {
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
        '_type.string': 'asukoht',
        '_parent.reference': mapId,
        limit: 10000,
        props: 'name.string,lat.number,long.number,kirjeldus.string'
      })

      const rawLocations = searchResult?.entities || []

      // Normalize coordinates at API boundary - convert from Entu's nested format to simple {lat, lng}
      const locations = rawLocations.map((location) => {
        const normalizedLocation = { ...location }

        // Extract coordinates from Entu's nested format and create normalized coordinates
        if (location.lat && location.lat[0] && location.long && location.long[0]) {
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
  const loadTaskLocations = async (task) => {
    if (!task) {
      throw new Error('Task is required')
    }

    // Get map reference from task - check multiple possible locations
    let mapReference = task.kaart?.[0]?.reference
      || task.entity?.properties?.kaart?.[0]?.reference
      || task.entity?.kaart?.[0]?.reference
      || task.kaart

    // If mapReference is an object, extract the ID
    if (typeof mapReference === 'object' && mapReference !== null) {
      mapReference = mapReference.reference || mapReference._id || mapReference.id
    }

    if (!mapReference || typeof mapReference !== 'string') {
      return []
    }

    return await loadMapLocations(mapReference)
  }

  // Sort locations by distance from user
  const sortByDistance = (locations, position = null) => {
    const pos = position || userPosition.value
    console.log('📍 [EVENT] useLocation - sortByDistance called', {
      locationsCount: locations?.length || 0,
      hasPosition: !!pos,
      position: pos,
      userPositionGlobal: userPosition.value,
      permissionDenied: globalPermissionDenied.value
    })

    const result = sortLocationsByDistance(locations, pos)
    console.log('📍 [EVENT] useLocation - sortByDistance result', {
      resultCount: result?.length || 0,
      sorted: !!pos
    })
    return result
  }

  // Get sorted locations with distance info
  const getSortedLocations = (locations) => {
    return computed(() => {
      return sortByDistance(locations, userPosition.value)
    })
  }

  // Format coordinates for display
  const formatCoordinates = (coordinates) => {
    if (!coordinates) return ''

    if (typeof coordinates === 'string') {
      const [lat, lng] = coordinates.split(',').map((c) => c.trim())
      return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`
    }

    if (coordinates.lat && coordinates.lng) {
      return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
    }

    return ''
  }

  // Convert location to coordinate string
  const getLocationCoordinates = (location) => {
    if (!location) {
      return ''
    }

    // If coordinates were already calculated by sortLocationsByDistance
    if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
      return `${location.coordinates.lat},${location.coordinates.lng}`
    }

    // Try to extract from separate lat/long fields (various formats)
    const lat = location.lat?.[0]?.number
      || location.lat?.[0]?.value
      || location.lat?.[0]?.string
      || location.properties?.lat?.[0]?.value
      || location.properties?.lat?.[0]?.number
      || location.properties?.lat?.[0]?.string
    const lng = location.long?.[0]?.number
      || location.long?.[0]?.value
      || location.long?.[0]?.string
      || location.properties?.long?.[0]?.value
      || location.properties?.long?.[0]?.number
      || location.properties?.long?.[0]?.string

    if (lat != null && lng != null) {
      return `${lat},${lng}`
    }

    return ''
  }

  // Extract location name for display
  const getLocationName = (location) => {
    return location.name?.[0]?.string
      || location.properties?.name?.[0]?.value
      || location.properties?.nimi?.[0]?.value
      || location.name
      || 'Nimetu asukoht'
  }

  // Extract location description
  const getLocationDescription = (location) => {
    return location.properties?.description?.[0]?.value
      || location.properties?.kirjeldus?.[0]?.value
      || location.description
      || null
  }

  // Clear user position and stop updates
  const clearUserPosition = () => {
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
