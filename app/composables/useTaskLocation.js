/**
 * Composable for task location utilities
 * Handles coordinate parsing, geolocation, and task location management
 */
export const useTaskLocation = () => {
  const { t } = useI18n()

  /**
     * Extract coordinates from location object
     * @param {Object} location - Location object with various possible formats
     * @returns {string|null} Coordinates as "lat,lng" string or null
     */
  const getLocationCoordinates = (location) => {
    // Extract coordinates from location object
    if (location?.coordinates) {
      return location.coordinates
    }
    if (location?.lat && location?.lng) {
      return `${location.lat},${location.lng}`
    }
    return null
  }

  /**
     * Parse coordinate string into lat/lng object
     * @param {string} coordString - Coordinates as "lat,lng" string
     * @returns {Object|null} Object with lat/lng properties or null
     */
  const parseCoordinates = (coordString) => {
    if (!coordString || typeof coordString !== 'string') return null

    try {
      const parts = coordString.split(',').map((s) => s.trim())
      if (parts.length !== 2) return null

      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])

      if (isNaN(lat) || isNaN(lng)) return null
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

      return { lat, lng }
    }
    catch {
      return null
    }
  }

  /**
     * Get current user position using browser geolocation
     * @returns {Promise<Object>} Promise resolving to coordinates object
     */
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t('taskDetail.geolocationNotSupported')))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
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
     * Load locations for a specific task
     * @param {Object} task - Task object
     * @param {Object} userPosition - Optional user position for sorting
     * @returns {Promise<Array>} Promise resolving to array of locations
     */
  const loadTaskLocations = async (task, userPosition = null) => {
    if (!task) {
      return []
    }

    try {
      const { loadMapLocations, sortByDistance } = useLocation()

      // Debug: Log the task structure to understand the data format
      console.log('Loading locations for task:', task)

      // Extract map ID from task - use reference field for actual map entity
      // 'kaart' is Estonian for 'map' and is typically an array in Entu
      const mapId = task.kaart?.[0]?.reference || task.kaart?.[0]?.id
        || task.kaart?.id || task.kaart
        || task.map?.[0]?.reference || task.map?.[0]?.id
        || task.map?.id || task.mapId || task.map

      console.log('Extracted mapId:', mapId)

      if (!mapId) {
        console.warn('No map ID found in task:', task)
        return []
      }

      // Load locations for this map
      const locations = await loadMapLocations(mapId)
      console.log('Loaded locations:', locations)

      // Sort by distance if user position is available
      if (userPosition && locations.length > 0) {
        return sortByDistance(locations, userPosition)
      }

      return locations
    }
    catch (error) {
      console.error('Error loading task locations:', error)
      return []
    }
  }

  return {
    getLocationCoordinates,
    parseCoordinates,
    getCurrentPosition,
    loadTaskLocations
  }
}
