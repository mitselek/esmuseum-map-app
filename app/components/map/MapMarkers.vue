<template>
  <!-- User location marker -->
  <LMarker
    v-if="userPosition"
    :lat-lng="[userPosition.lat, userPosition.lng]"
    :icon="userIcon"
  >
    <LPopup>
      <div class="text-center">
        <div class="text-lg">📍</div>
        <p class="font-medium">
          {{ $t("map.yourLocation") }}
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
          <div v-if="location.distance" class="text-xs text-blue-600">
            {{ formatDistance(location.distance) }}
          </div>
        </div>

        <button
          v-if="!isLocationVisited(location)"
          class="mt-2 w-full rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
          @click="selectLocation(location)"
        >
          {{ $t("map.selectLocation") }}
        </button>
      </div>
    </LPopup>
  </LMarker>
</template>

<script setup>
/**
 * Map Markers Component
 * Handles user location marker, task location markers, and marker interactions
 */
import { useLocationFormatting } from "@/composables/useLocationFormatting";
import { useMapIcons } from "@/composables/useMapIcons";

const props = defineProps({
  userPosition: {
    type: Object,
    default: null,
  },
  displayedLocations: {
    type: Array,
    default: () => [],
  },
  visitedLocations: {
    type: Array,
    default: () => [],
  },
  selectedLocation: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["location-click", "select-location"]);

// Use map icons composable
const { userIcon, getLocationIcon } = useMapIcons();

// Use location formatting composable
const {
  formatCoordinates,
  formatDistance,
  getLocationName,
  getLocationDescription,
} = useLocationFormatting();

// Marker references for programmatic access
const markerRefs = ref(new Map());

// Set marker reference
const setMarkerRef = (el, location) => {
  if (el) {
    markerRefs.value.set(location._id || location.id, el);
  }
};

// Check if a location has been visited
const isLocationVisited = (location) => {
  const locationRef = location.reference || location._id;
  if (!locationRef || !props.visitedLocations) return false;

  return props.visitedLocations.some(
    (visited) =>
      visited.reference === locationRef ||
      visited._id === locationRef ||
      visited.location?.reference === locationRef ||
      visited.location?._id === locationRef
  );
};

// Location click handler
const onLocationClick = (location) => {
  emit("location-click", location);
};

// Select location handler
const selectLocation = (location) => {
  emit("select-location", location);
};

// Expose marker references for parent access
defineExpose({
  markerRefs,
});
</script>

<style scoped>
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
