/**
 * Location management composable for task responses
 * Handles location loading, distance calculation, and user position
 */

import { ref, computed } from 'vue'
import { sortLocationsByDistance, getCurrentPosition } from '~/utils/distance'

export const useLocation = () => {
  // Reactive state
  const userPosition = ref(null)
  const gettingLocation = ref(false)
  const locationError = ref(null)

  // Auto-request GPS position when component loads
  const requestGPSOnLoad = async () => {
    try {
      await getUserPosition()
    }
    catch (err) {
      console.warn('Could not get GPS position on load:', err)
      // Don't throw error - GPS is optional
    }
  }

  // Get user's current position
  const getUserPosition = async (options = {}) => {
    gettingLocation.value = true
    locationError.value = null

    try {
      const position = await getCurrentPosition(options)
      userPosition.value = position
      return position
    }
    catch (error) {
      locationError.value = error.message
      console.error('Error getting user position:', error)
      throw error
    }
    finally {
      gettingLocation.value = false
    }
  }

  // Load locations for a specific map
  const loadMapLocations = async (mapId) => {
    if (!mapId) {
      throw new Error('Map ID is required')
    }

    const { token } = useEntuAuth()

    try {
      // Query locations that belong to this map via server API
      const response = await $fetch(`/api/locations/${mapId}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return response?.entities || []
    }
    catch (error) {
      console.error('Error loading map locations:', error)
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
      || task.kaart?.[0]?._id
      || task.entity?.properties?.kaart?.[0]?.reference
      || task.entity?.properties?.kaart?.[0]?._id
      || task.entity?.kaart?.[0]?.reference
      || task.entity?.kaart?.[0]?._id
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
    return sortLocationsByDistance(locations, pos)
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

    // Try to extract from geopunkt field (various formats)
    const geopunkt = location.geopunkt?.[0]?.string
      || location.geopunkt?.[0]?.value
      || location.geopunkt
      || location.properties?.geopunkt?.[0]?.value
      || location.properties?.geopunkt?.[0]?.string
    if (geopunkt) {
      return geopunkt
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

  // Clear user position
  const clearUserPosition = () => {
    userPosition.value = null
    locationError.value = null
  }

  return {
    // State
    userPosition,
    gettingLocation,
    locationError,

    // Methods
    getUserPosition,
    requestGPSOnLoad,
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
