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

              <div class="mt-2 flex justify-between">
                <div class="text-xs text-gray-500">
                  {{ formatCoordinates(location.coordinates) }}
                </div>
                <div
                  v-if="location.distance"
                  class="text-xs text-blue-600"
                >
                  {{ formatDistance(location.distance) }}
                </div>
              </div>

              <button
                v-if="!isLocationVisited(location)"
                class="mt-2 w-full rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                @click="selectLocation(location)"
              >
                {{ $t('map.selectLocation') }}
              </button>
            </div>
          </LPopup>
        </LMarker>
      </LMap>
    </div>
  </div>
</template>

<script setup>
/**
 * Interactive Map Component - Modular Refactored Version
 *
 * This component has been refactored to comply with Article VII constitutional requirements
 * Original: 459 lines -> Modular: ~180 lines + extracted composables
 *
 * Concerns separated into:
 * - Map rendering and display (this component)
 * - Map configuration logic (useMapConfig composable)
 * - Marker management (useMapMarkers composable)
 * - Location utilities (useMapLocations composable)
 */
import { useMapConfig } from '@/composables/useMapConfig'
import { useMapMarkers } from '@/composables/useMapMarkers'
import { useMapLocations } from '@/composables/useMapLocations'

// Props
const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  visitedLocations: {
    type: Array,
    default: () => []
  },
  selectedLocation: {
    type: Object,
    default: null
  },
  userPosition: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  autoCenter: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['location-selected', 'marker-clicked', 'map-ready'])

// Use composables for separated concerns
const {
  zoom,
  center,
  mapOptions,
  tileOptions,
  attribution,
  onMapReady: handleMapReady
} = useMapConfig(props)

const {
  userIcon,
  getLocationIcon,
  markerRefs,
  setMarkerRef
} = useMapMarkers(props)

const {
  displayedLocations,
  isLocationVisited,
  getLocationName,
  getLocationDescription,
  formatCoordinates,
  formatDistance
} = useMapLocations(props)

// Map instance reference
const map = ref(null)

// Map ready handler
const onMapReady = (mapInstance) => {
  handleMapReady(mapInstance)
  emit('map-ready', mapInstance)
}

// Location interaction handlers
const onLocationClick = (location) => {
  emit('marker-clicked', location)
}

const selectLocation = (location) => {
  emit('location-selected', location)
}

// Expose for parent component access
defineExpose({
  map,
  markerRefs
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-tip) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
