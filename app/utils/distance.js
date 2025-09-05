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

/**
 * Sort locations by distance from a reference point
 * @param {Array} locations - Array of location objects with coordinates
 * @param {object} userPosition - User's position with lat/lng properties
 * @param {string} coordinateField - Field name containing coordinates (default: 'geopunkt')
 * @returns {Array} Sorted array of locations with distance property added
 */
export function sortLocationsByDistance (locations, userPosition, coordinateField = 'geopunkt') {
  if (!userPosition || !userPosition.lat || !userPosition.lng) {
    return locations
  }

  return locations
    .map((location) => {
      let coordinates = null

      // Try to extract coordinates from geopunkt field (string format)
      const coordString = location.properties?.[coordinateField]?.[0]?.value
        || location.properties?.[coordinateField]
        || location[coordinateField]

      if (coordString) {
        coordinates = parseCoordinates(coordString)
      }

      // If no geopunkt, try to extract from separate lat/long fields
      if (!coordinates) {
        const lat = location.lat?.[0]?.number || location.properties?.lat?.[0]?.value || location.properties?.lat?.[0]?.number
        const lng = location.long?.[0]?.number || location.properties?.long?.[0]?.value || location.properties?.long?.[0]?.number

        if (lat != null && lng != null) {
          coordinates = {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          }
        }
      }

      if (!coordinates) {
        return {
          ...location,
          distance: Infinity,
          distanceText: 'Asukoht teadmata',
          coordinates: null
        }
      }

      const distance = calculateDistance(
        userPosition.lat,
        userPosition.lng,
        coordinates.lat,
        coordinates.lng
      )

      return {
        ...location,
        distance,
        distanceText: formatDistance(distance),
        coordinates
      }
    })
    .sort((a, b) => a.distance - b.distance)
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
