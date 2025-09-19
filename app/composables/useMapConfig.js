/**
 * Map Configuration Composable
 * Handles map zoom, center, and configuration options
 */
import { ref, watch } from 'vue'

export const useMapConfig = (props) => {
    // Reactive map state
    const zoom = ref(13)
    const center = ref([59.437, 24.7536]) // Default to Tallinn

    // Map configuration options
    const mapOptions = {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true
    }

    const tileOptions = {
        maxZoom: 18,
        minZoom: 3
    }

    const attribution = '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'

    // Update center when user position changes
    watch(
        () => props.userPosition,
        (newPosition) => {
            if (newPosition && props.autoCenter) {
                center.value = [newPosition.lat, newPosition.lng]
            }
        },
        { immediate: true }
    )

    // Map ready handler
    const onMapReady = (mapInstance) => {
        // Additional map setup can be done here
        console.log('Map ready:', mapInstance)
    }

    return {
        zoom,
        center,
        mapOptions,
        tileOptions,
        attribution,
        onMapReady
    }
}
