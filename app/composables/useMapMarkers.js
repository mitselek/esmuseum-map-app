/**
 * Map Markers Composable
 * Handles marker creation, icons, and marker references
 */
import { ref } from 'vue'

export const useMapMarkers = (props) => {
    // Marker references for programmatic access
    const markerRefs = ref(new Map())

    // Custom Leaflet icons (using global L from Leaflet plugin)
    const userIcon = globalThis.L?.divIcon({
        html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
        className: 'custom-user-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    })

    const locationIcon = globalThis.L?.divIcon({
        html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
        className: 'custom-location-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    })

    const visitedLocationIcon = globalThis.L?.divIcon({
        html: '<div style="background: #22c55e; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">✓</div>',
        className: 'custom-visited-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    })

    const selectedLocationIcon = globalThis.L?.divIcon({
        html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 3px solid #1d4ed8; box-shadow: 0 4px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite;">📍</div>',
        className: 'custom-selected-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    })

    // Get appropriate icon for a location
    const getLocationIcon = (location) => {
        const locationRef = location.reference || location._id
        const isSelected = props.selectedLocation && (props.selectedLocation.reference === locationRef || props.selectedLocation._id === locationRef)
        const isVisited = props.visitedLocations && props.visitedLocations.some((visited) =>
            visited.reference === locationRef
            || visited._id === locationRef
            || visited.location?.reference === locationRef
            || visited.location?._id === locationRef
        )

        if (isSelected) {
            return selectedLocationIcon
        }
        if (isVisited) {
            return visitedLocationIcon
        }
        return locationIcon
    }

    // Set marker reference for programmatic access
    const setMarkerRef = (el, location) => {
        if (el) {
            markerRefs.value.set(location._id || location.id, el)
        }
    }

    return {
        userIcon,
        locationIcon,
        visitedLocationIcon,
        selectedLocationIcon,
        getLocationIcon,
        setMarkerRef,
        markerRefs
    }
}
