/**
 * Map Locations Composable
 * Handles location data processing, formatting, and utilities
 */
import { computed } from 'vue'

export const useMapLocations = (props) => {
    // Computed displayed locations (can add filtering logic here)
    const displayedLocations = computed(() => {
        return props.locations || []
    })

    // Check if a location has been visited
    const isLocationVisited = (location) => {
        const locationRef = location.reference || location._id
        if (!locationRef || !props.visitedLocations) return false

        return props.visitedLocations.some((visited) =>
            visited.reference === locationRef
            || visited._id === locationRef
            || visited.location?.reference === locationRef
            || visited.location?._id === locationRef
        )
    }

    // Format coordinates for display
    const formatCoordinates = (coords) => {
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
            return 'N/A'
        }
        return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
    }

    // Format distance for display
    const formatDistance = (distance) => {
        if (typeof distance !== 'number') return ''
        return distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`
    }

    // Get location name with fallback
    const getLocationName = (location) => {
        return location.nimi?.[0]?.string
            || location.name
            || location.title
            || 'Unknown Location'
    }

    // Get location description with fallback
    const getLocationDescription = (location) => {
        return location.kirjeldus?.[0]?.string
            || location.description
            || location.details
            || ''
    }

    return {
        displayedLocations,
        isLocationVisited,
        formatCoordinates,
        formatDistance,
        getLocationName,
        getLocationDescription
    }
}
