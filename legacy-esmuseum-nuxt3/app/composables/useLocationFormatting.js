/**
 * Location Formatting and Display Utilities Composable
 * Handles coordinate formatting, display, and location data extraction
 * @file useLocationFormatting.js
 */

/**
 * Location formatting composable
 * Provides utilities for formatting coordinates and extracting location information
 */
export function useLocationFormatting () {
  /**
     * Format coordinates for display
     */
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

  /**
     * Convert location to coordinate string
     */
  const getLocationCoordinates = (location) => {
    if (!location) {
      return ''
    }

    if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
      return `${location.coordinates.lat},${location.coordinates.lng}`
    }

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

  /**
     * Extract location name for display
     */
  const getLocationName = (location) => {
    return location.name?.[0]?.string
      || location.properties?.name?.[0]?.value
      || location.properties?.nimi?.[0]?.value
      || location.name
      || 'Nimetu asukoht'
  }

  /**
     * Extract location description
     */
  const getLocationDescription = (location) => {
    return location.properties?.description?.[0]?.value
      || location.properties?.kirjeldus?.[0]?.value
      || location.description
      || null
  }

  return {
    formatCoordinates,
    getLocationCoordinates,
    getLocationName,
    getLocationDescription
  }
}
