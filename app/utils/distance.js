/**
 * Distance calculation utilities for geolocation features
 */

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance (lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Parse coordinate string to latitude and longitude
 * @param {string} coordinates - Coordinate string in "lat,lng" format
 * @returns {object|null} Object with lat and lng properties, or null if invalid
 */
export function parseCoordinates (coordinates) {
  if (!coordinates || typeof coordinates !== 'string') {
    return null
  }

  const parts = coordinates.split(',').map((part) => part.trim())
  if (parts.length !== 2) {
    return null
  }

  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])

  if (isNaN(lat) || isNaN(lng)) {
    return null
  }

  // Basic validation for reasonable coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }

  return { lat, lng }
}

/**
 * Round coordinates to specified decimal places (default 6)
 * 6 decimal places = ~0.11m precision, sufficient for most geolocation needs
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} decimals - Number of decimal places (default: 6)
 * @returns {object} Object with rounded lat and lng
 */
export function roundCoordinates (lat, lng, decimals = 6) {
  const factor = Math.pow(10, decimals)
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor
  }
}

/**
 * Format distance for display to users
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance (distance) {
  if (distance < 0.01) {
    return 'Väga lähedal'
  }
  else if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  else if (distance < 10) {
    return `${distance.toFixed(1)} km`
  }
  else {
    return `${Math.round(distance)} km`
  }
}

// Cache for location coordinates to avoid re-parsing
const coordinateCache = new WeakMap()

/**
 * Get coordinates for a location with caching
 * @param {object} location - Location object
 * @param {string} coordinateField - Field name containing coordinates
 * @returns {object|null} Coordinates object or null
 */
/**
 * Extract coordinates from a location object
 * @param {object} location - Location object
 * @returns {object|null} Coordinates object or null
 */
function getLocationCoordinates (location) {
  // Check cache first
  if (coordinateCache.has(location)) {
    return coordinateCache.get(location)
  }

  let coordinates = null

  // Try to extract from separate lat/long fields (locations use these)
  const lat = location.lat?.[0]?.number || location.properties?.lat?.[0]?.value || location.properties?.lat?.[0]?.number
  const lng = location.long?.[0]?.number || location.properties?.long?.[0]?.value || location.properties?.long?.[0]?.number

  if (lat != null && lng != null) {
    coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) }
  }

  // Cache the result
  coordinateCache.set(location, coordinates)
  return coordinates
}

/**
 * Sort locations by distance from a reference point
 * @param {Array} locations - Array of location objects with coordinates
 * @param {object} userPosition - User's position with lat/lng properties
 * @returns {Array} Sorted array of locations with distance property added
 */
export function sortLocationsByDistance (locations, userPosition) {
  if (!userPosition || !userPosition.lat || !userPosition.lng) {
    return locations
  }

  // Create array of [location, distance] pairs for sorting
  const locationsWithDistance = locations.map((location) => {
    const coordinates = getLocationCoordinates(location)

    if (!coordinates) {
      return [location, Infinity, 'Asukoht teadmata', null]
    }

    const distance = calculateDistance(
      userPosition.lat,
      userPosition.lng,
      coordinates.lat,
      coordinates.lng
    )

    return [location, distance, formatDistance(distance), coordinates]
  })

  // Sort by distance
  locationsWithDistance.sort((a, b) => a[1] - b[1])

  // Return new objects with distance properties
  return locationsWithDistance.map(([location, distance, distanceText, coordinates]) => ({
    ...location,
    distance,
    distanceText,
    coordinates
  }))
}

/**
 * Get user's current position using browser geolocation API
 * @param {object} options - Geolocation options
 * @returns {Promise<object>} Promise that resolves to position object with lat/lng
 */
export function getCurrentPosition (options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolokatsioon pole selles brauseris toetatud'))
      return
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let message = 'Asukoha määramisel tekkis viga'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Asukoha luba keelatud'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Asukoht pole saadaval'
            break
          case error.TIMEOUT:
            message = 'Asukoha määramine aegus'
            break
        }
        reject(new Error(message))
      },
      defaultOptions
    )
  })
}
