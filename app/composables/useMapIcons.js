/**
 * Map Icons Composable
 * Provides custom Leaflet icons for different marker types
 */

export const useMapIcons = () => {
    // Custom icons using Leaflet divIcon
    const userIcon = L.divIcon({
        html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
        className: 'custom-user-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    })

    const locationIcon = L.divIcon({
        html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
        className: 'custom-location-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    })

    const visitedLocationIcon = L.divIcon({
        html: '<div style="background: #22c55e; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">✓</div>',
        className: 'custom-visited-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    })

    const selectedLocationIcon = L.divIcon({
        html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 3px solid #1d4ed8; box-shadow: 0 4px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite;">📍</div>',
        className: 'custom-selected-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    })

    // Get appropriate icon for a location based on its state
    const getLocationIcon = (location, isSelected = false, isVisited = false) => {
        if (isSelected) {
            return selectedLocationIcon
        }
        if (isVisited) {
            return visitedLocationIcon
        }
        return locationIcon
    }

    return {
        userIcon,
        locationIcon,
        visitedLocationIcon,
        selectedLocationIcon,
        getLocationIcon
    }
}
