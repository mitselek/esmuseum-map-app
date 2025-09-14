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
      ref="mapContainer"
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
          :lat-lng="[location.coordinates.lat, location.coordinates.lng]"
          :icon="getLocationIcon(location)"
        >
          <LPopup>
            <div>
              <h3 class="font-medium">
                {{ getLocationName(location) }}
              </h3>
              <div
                v-if="isLocationVisited(location)"
                class="mb-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
              >
                ✓ {{ $t('map.visited') }}
              </div>
              <p
                v-if="getLocationDescription(location)"
                class="mt-1 text-sm text-gray-600"
              >
                {{ getLocationDescription(location) }}
              </p>
              <p class="mt-2 text-xs text-gray-500">
                <span v-if="location.distanceText">
                  📏 {{ location.distanceText }}
                </span>
                <br>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
} from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Import location utility
const { formatCoordinates, getLocationName, getLocationDescription } = useLocation()

// Import Leaflet CSS

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
   * Maximum number of locations to display
   */
  maxLocations: {
    type: Number,
    default: 5
  },
  /**
   * Array of completed task IDs to filter out
   */
  completedTasks: {
    type: Array,
    default: () => []
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
  }
})

const emit = defineEmits(['location-click', 'map-ready'])

// Component state
const map = ref(null)
const mapContainer = ref(null)
const error = ref(null)
const zoom = ref(13)
const center = ref([59.4370, 24.7536]) // Default to Tallinn

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

// Check if a location has been visited
const isLocationVisited = (location) => {
  const locationRef = location.reference || location._id
  if (!locationRef || !props.visitedLocations) return false

  return props.visitedLocations.has(locationRef)
}// Get appropriate icon for location
const getLocationIcon = (location) => {
  return isLocationVisited(location) ? visitedLocationIcon : locationIcon
}

// Filter and process locations
const displayedLocations = computed(() => {
  console.log('InteractiveMap - Completed tasks:', props.completedTasks)

  if (!props.locations?.length) {
    console.log('InteractiveMap - No locations provided')
    return []
  }

  // Filter out completed tasks
  const unvisitedLocations = props.locations.filter((location) => {
    const taskId = location._id || location.id
    return !props.completedTasks.includes(taskId)
  })

  // Filter locations that have valid coordinates
  const locationsWithCoords = unvisitedLocations.filter((location) => {
    const hasCoords = location.coordinates
      && location.coordinates.lat
      && location.coordinates.lng
    return hasCoords
  })

  // Sort by distance if user position is available
  let sortedLocations = locationsWithCoords
  if (props.userPosition) {
    sortedLocations = locationsWithCoords.sort((a, b) => {
      return (a.distance || 0) - (b.distance || 0)
    })
  }

  // Limit to max locations
  const finalLocations = sortedLocations.slice(0, props.maxLocations)
  console.log('InteractiveMap - Final displayed locations:', finalLocations)
  return finalLocations
})

// Calculate map bounds and center
const calculateMapBounds = async () => {
  if (!map.value?.leafletObject) return

  const bounds = []

  // Add user position if available
  if (props.userPosition) {
    bounds.push([props.userPosition.lat, props.userPosition.lng])
  }

  // Add displayed locations
  displayedLocations.value.forEach((location) => {
    if (location.coordinates) {
      bounds.push([location.coordinates.lat, location.coordinates.lng])
    }
  })

  if (bounds.length === 0) return

  // Wait a bit for the map to fully initialize
  await new Promise((resolve) => setTimeout(resolve, 100))

  try {
    // Check if map container is properly initialized
    if (!map.value?.leafletObject._container || !map.value.leafletObject._size) {
      console.warn('Map container not ready yet, skipping bounds calculation')
      return
    }

    if (bounds.length === 1) {
      // Single point - center and use default zoom
      center.value = bounds[0]
      zoom.value = 15
      map.value.leafletObject.setView(bounds[0], 15)
    }
    else {
      // Multiple points - fit bounds with padding
      const leafletBounds = L.latLngBounds(bounds)
      map.value.leafletObject.fitBounds(leafletBounds, {
        padding: [20, 20],
        maxZoom: 16
      })
    }
  }
  catch (err) {
    console.warn('Error calculating map bounds:', err)
    error.value = 'Kaardi piirkonna arvutamisel tekkis viga'
  }
}

// Map ready handler
const onMapReady = async () => {
  await nextTick()
  await calculateMapBounds()
  emit('map-ready')
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
