<template>
  <div
    class="h-64 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
  >
    <!-- Loading state -->
    <div v-if="loading" class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="text-2xl">🗺️</div>
        <p class="mt-2 text-sm text-gray-600">
          {{ $t("map.loading") }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="text-2xl">⚠️</div>
        <p class="mt-2 text-sm text-red-600">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- Map container -->
    <div v-else class="size-full">
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

        <!-- Slot for markers and other map content -->
        <slot />
      </LMap>
    </div>
  </div>
</template>

<script setup>
/**
 * Map Display Component
 * Handles the core Leaflet map rendering, tile layer, and basic configuration
 */

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  zoom: {
    type: Number,
    default: 13,
  },
  center: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["ready"]);

// Map instance reference
const map = ref(null);

// Map configuration
const mapOptions = {
  zoomControl: true,
  attributionControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  dragging: true,
};

const tileOptions = {
  maxZoom: 18,
  minZoom: 3,
};

const attribution =
  '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

// Map ready handler
const onMapReady = (mapInstance) => {
  emit("ready", mapInstance);
};

// Expose map instance
defineExpose({
  map,
});
</script>

<style scoped>
/* Ensure map container has proper styling */
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>
