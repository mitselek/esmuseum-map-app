/**
 * Location utilities for map-list synchronization
 *
 * These utilities help coordinate between the interactive map and location picker
 * by providing robust location comparison and identification methods.
 */

/**
 * Extract normalized coordinates from a location object
 * @param {Object} location - Location object (can have various formats)
 * @returns {Object|null} - { lat: number, lng: number } or null
 */
export const getLocationCoordinates = (location) => {
  if (!location) return null

  // Handle different coordinate formats
  if (location.lat !== undefined && location.lng !== undefined) {
    return { lat: location.lat, lng: location.lng }
  }

  if (location.latitude !== undefined && location.longitude !== undefined) {
    return { lat: location.latitude, lng: location.longitude }
  }

  // Handle coordinate arrays [lat, lng]
  if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    return { lat: location.coordinates[0], lng: location.coordinates[1] }
  }

  // Handle nested coordinate objects
  if (location.coordinates) {
    return getLocationCoordinates(location.coordinates)
  }

  // Handle GPS position format
  if (location.coords) {
    return { lat: location.coords.latitude, lng: location.coords.longitude }
  }

  return null
}

/**
 * Check if two locations represent the same geographic point
 * @param {Object} location1 - First location
 * @param {Object} location2 - Second location
 * @param {number} tolerance - Tolerance in degrees (default: ~1 meter precision)
 * @returns {boolean} - True if locations are the same
 */
export const isSameLocation = (location1, location2, tolerance = 0.00001) => {
  if (!location1 || !location2) return false

  const coords1 = getLocationCoordinates(location1)
  const coords2 = getLocationCoordinates(location2)

  if (!coords1 || !coords2) return false

  const latDiff = Math.abs(coords1.lat - coords2.lat)
  const lngDiff = Math.abs(coords1.lng - coords2.lng)

  return latDiff < tolerance && lngDiff < tolerance
}

/**
 * Find a location in an array that matches the given location
 * @param {Object} targetLocation - Location to find
 * @param {Array} locations - Array of locations to search
 * @returns {Object|null} - Matching location or null
 */
export const findMatchingLocation = (targetLocation, locations) => {
  if (!targetLocation || !Array.isArray(locations)) return null

  return locations.find((location) => isSameLocation(targetLocation, location)) || null
}

/**
 * Get a location identifier for debugging/logging
 * @param {Object} location - Location object
 * @returns {string} - Human-readable location identifier
 */
export const getLocationIdentifier = (location) => {
  if (!location) return 'null'

  const coords = getLocationCoordinates(location)
  if (!coords) return 'invalid-coords'

  const name = location.nimi || location.name || location.string || 'unnamed'
  return `${name} (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`
}
