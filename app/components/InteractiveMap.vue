<template>
  <div class="h-64 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex h-full items-center justify-center"
    >
      <div class="text-center">
        <div class="text-2xl">
          🗺️
        </div>
        <p class="mt-2 text-sm text-gray-600">
          {{ $t('map.loading') }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="flex h-full items-center justify-center"
    >
      <div class="text-center">
        <div class="text-2xl">
          ⚠️
        </div>
        <p class="mt-2 text-sm text-red-600">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- Map container -->
    <div
      v-else
      class="size-full"
    >
      <LMap
        ref="map"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        @ready="onMapReady"
      >
        <!-- Tile layer -->
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          :attribution="attribution"
          :options="tileOptions"
        />

        <!-- User location marker -->
        <LMarker
          v-if="userPosition"
          :lat-lng="[userPosition.lat, userPosition.lng]"
          :icon="userIcon"
        >
          <LPopup>
            <div class="text-center">
              <div class="text-lg">
                📍
              </div>
              <p class="font-medium">
                {{ $t('map.yourLocation') }}
              </p>
              <p class="text-xs text-gray-600">
                {{ formatCoordinates(userPosition) }}
              </p>
            </div>
          </LPopup>
        </LMarker>

        <!-- Task location markers -->
        <LMarker
          v-for="location in displayedLocations"
          :key="location._id || location.id"
          :ref="(el) => setMarkerRef(el, location)"
          :lat-lng="[location.coordinates.lat, location.coordinates.lng]"
          :icon="getLocationIcon(location)"
          @click="onLocationClick(location)"
        >
          <LPopup>
            <div>
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-medium">
                    {{ getLocationName(location) }}
                  </h3>
                  <p
                    v-if="getLocationDescription(location)"
                    class="mt-1 text-sm text-gray-600"
                  >
                    {{ getLocationDescription(location) }}
                  </p>
                </div>
                <div
                  v-if="isLocationVisited(location)"
                  class="ml-2 text-lg text-green-600"
                >
                  ✓
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500">
                {{ formatCoordinates(location.coordinates) }}
              </p>
            </div>
          </LPopup>
        </LMarker>
      </LMap>
    </div>
  </div>
</template>

<script setup>
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
} from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { isSameLocation } from '~/utils/location-sync'

// Import location utility
const { formatCoordinates, getLocationName, getLocationDescription } = useLocation()

// Fix Leaflet icon issues in bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

const props = defineProps({
  /**
   * Array of task locations to display on map
   */
  locations: {
    type: Array,
    default: () => []
  },
  /**
   * User's current GPS position
   */
  userPosition: {
    type: Object,
    default: null
  },
  /**
   * Maximum number of closest unvisited locations to use for map viewport centering
   * All locations (visited + unvisited) are displayed as markers
   */
  maxLocations: {
    type: Number,
    default: 5
  },
  /**
   * Set of visited location references for green markers
   */
  visitedLocations: {
    type: Set,
    default: () => new Set()
  },
  /**
   * Loading state from parent
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Currently selected location for highlighting
   */
  selectedLocation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['map-ready', 'location-click'])

// Component state
const map = ref(null)
const error = ref(null)
const zoom = ref(13)
const center = ref([59.4370, 24.7536]) // Default to Tallinn

// 🔍 EVENT TRACKING: Map component setup
console.log('🗺️ [EVENT] InteractiveMap - Component setup started', {
  timestamp: new Date().toISOString(),
  locationCount: props.locations?.length || 0
})

// Marker refs for popup control
const markerRefs = ref(new Map())

// Set marker reference for popup control
const setMarkerRef = (el, location) => {
  if (el) {
    const locationKey = location._id || location.id || `${location.coordinates.lat}-${location.coordinates.lng}`
    markerRefs.value.set(locationKey, el)
  }
}

// Map configuration
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

// Custom icons
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

// Check if a location has been visited
const isLocationVisited = (location) => {
  const locationRef = location.reference || location._id
  if (!locationRef || !props.visitedLocations) return false

  return props.visitedLocations.has(locationRef)
}

// Check if a location is currently selected
const isLocationSelected = (location) => {
  if (!props.selectedLocation || !location) return false
  return isSameLocation(location, props.selectedLocation)
}

// Get appropriate icon for location
const getLocationIcon = (location) => {
  if (isLocationSelected(location)) {
    return selectedLocationIcon
  }
  return isLocationVisited(location) ? visitedLocationIcon : locationIcon
}

// Filter and process locations
const displayedLocations = computed(() => {
  console.log('🗺️ [EVENT] InteractiveMap - Computing displayedLocations', {
    locationCount: props.locations?.length || 0,
    firstLocation: props.locations?.[0]
  })

  if (!props.locations?.length) {
    return []
  }

  // Filter locations that have valid normalized coordinates
  const locationsWithCoords = props.locations.filter((location, index) => {
    const hasCoords = location.coordinates
      && location.coordinates.lat
      && location.coordinates.lng

    // Log first few locations to debug structure
    if (index < 3) {
      console.log(`🗺️ [EVENT] InteractiveMap - Location ${index}:`, {
        id: location._id,
        hasCoords,
        coordinates: location.coordinates
      })
    }

    return hasCoords
  })

  console.log('🗺️ [EVENT] InteractiveMap - Filtered locations result:', {
    totalInput: props.locations.length,
    withValidCoords: locationsWithCoords.length
  })

  return locationsWithCoords
})

// Calculate the closest unvisited locations for viewport centering
const closestUnvisitedLocations = computed(() => {
  const unvisitedLocations = displayedLocations.value.filter((location) => {
    return !isLocationVisited(location)
  })

  // Just take the first few unvisited locations for viewport centering
  // (Distance sorting happens in LocationPicker where it's actually used)
  return unvisitedLocations.slice(0, props.maxLocations)
})

// Calculate map bounds and center
const calculateMapBounds = async () => {
  try {
    console.log('🗺️ [EVENT] InteractiveMap - calculateMapBounds called', {
      hasMapRef: !!map.value,
      hasLeafletObject: !!map.value?.leafletObject,
      locationCount: props.locations?.length || 0,
      closestUnvisited: closestUnvisitedLocations.value?.length || 0
    })

    if (!map.value?.leafletObject) {
      console.log('🗺️ [EVENT] InteractiveMap - Map not ready, skipping bounds calculation')
      return
    }

    const bounds = []

    // Add user position if available
    if (props.userPosition) {
      console.log('🗺️ [EVENT] InteractiveMap - Adding user position to bounds', props.userPosition)
      bounds.push([props.userPosition.lat, props.userPosition.lng])
    }

    // Add closest unvisited locations for viewport centering
    closestUnvisitedLocations.value.forEach((location, index) => {
      if (location.coordinates) {
        console.log(`🗺️ [EVENT] InteractiveMap - Adding location ${index} to bounds`, {
          id: location._id,
          coordinates: location.coordinates
        })
        bounds.push([location.coordinates.lat, location.coordinates.lng])
      }
    })

    console.log('🗺️ [EVENT] InteractiveMap - Total bounds points:', bounds.length)

    if (bounds.length === 0) return

    // Wait a bit for the map to fully initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Check if map container is properly initialized
    if (!map.value?.leafletObject._container || !map.value.leafletObject._size) {
      console.warn('🗺️ [EVENT] InteractiveMap - Map container not ready yet, skipping bounds calculation')
      return
    }

    if (bounds.length === 1) {
      // Single point - center and use default zoom
      console.log('🗺️ [EVENT] InteractiveMap - Setting single point view')
      center.value = bounds[0]
      zoom.value = 15
      map.value.leafletObject.setView(bounds[0], 15)
    }
    else {
      // Multiple points - fit bounds with padding
      console.log('🗺️ [EVENT] InteractiveMap - Fitting bounds for multiple points')
      const leafletBounds = L.latLngBounds(bounds)
      map.value.leafletObject.fitBounds(leafletBounds, {
        padding: [20, 20],
        maxZoom: 16
      })
    }
  }
  catch (err) {
    console.error('🗺️ [EVENT] InteractiveMap - Error calculating map bounds:', err)
    error.value = 'Kaardi piirkonna arvutamisel tekkis viga'
  }
}

// Location click handler
const onLocationClick = (location) => {
  console.log('[InteractiveMap] Location clicked:', location.nimi || location.name || 'unnamed')
  // The popup will open automatically due to the click event
  // We'll emit this to parent for synchronization
  emit('location-click', location)
}

// Programmatically open popup for a location
const openLocationPopup = (location) => {
  if (!location) return

  const locationKey = location._id || location.id || `${location.coordinates?.lat}-${location.coordinates?.lng}`
  const markerRef = markerRefs.value.get(locationKey)

  if (markerRef && markerRef.leafletObject) {
    // Open the popup
    markerRef.leafletObject.openPopup()

    // Center the map on this location with a slight zoom
    if (map.value && map.value.leafletObject) {
      map.value.leafletObject.setView([location.coordinates.lat, location.coordinates.lng], Math.max(zoom.value, 15))
    }
  }
}

// Watch for selectedLocation changes to open popup
watch(() => props.selectedLocation, (newLocation, oldLocation) => {
  if (newLocation && !isSameLocation(newLocation, oldLocation)) {
    console.log('[InteractiveMap] Selected location changed, opening popup:', newLocation.nimi || newLocation.name || 'unnamed')
    nextTick(() => {
      openLocationPopup(newLocation)
    })
  }
}, { deep: true })

// Map ready handler
// Handle map ready event
const onMapReady = () => {
  try {
    // 🔍 EVENT TRACKING: Map ready
    console.log('🗺️ [EVENT] InteractiveMap - Map ready', {
      timestamp: new Date().toISOString(),
      locationCount: props.locations?.length || 0,
      hasUserPosition: !!props.userPosition
    })

    emit('map-ready')
  }
  catch (err) {
    console.error('🗺️ [EVENT] InteractiveMap - Error in onMapReady:', err)
    error.value = 'Kaardi käivitamisel tekkis viga'
  }
}

// Watch for location or position changes
watch([() => props.locations, () => props.userPosition], async () => {
  await nextTick()
  await calculateMapBounds()
}, { deep: true })

// Component lifecycle
onMounted(() => {
  // Set initial center based on user position or default
  if (props.userPosition) {
    center.value = [props.userPosition.lat, props.userPosition.lng]
  }
})
</script>

<style scoped>
/* Ensure map container has proper styling */
.leaflet-container {
  height: 100%;
  width: 100%;
}

/* Custom marker styles */
:deep(.custom-user-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-location-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-visited-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-selected-icon) {
  background: transparent !important;
  border: none !important;
}

/* Pulse animation for selected markers */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Popup styling */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-content) {
  margin: 12px;
  line-height: 1.4;
}
</style>
