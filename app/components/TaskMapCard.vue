<template>
  <div class="flex size-full flex-col bg-white shadow-sm">
    <div class="flex-1">
      <InteractiveMap
        :locations="taskLocations"
        :user-position="userPosition || undefined"
        :visited-locations="visitedLocations"
        :loading="loadingLocations"
        :max-locations="5"
        :selected-location="selectedLocation || undefined"
        @location-click="onLocationClick"
        @map-ready="onMapReady"
      />
    </div>

    <!-- Progress, Deadline, Description -->
    <div class="border-t bg-gray-50 px-4 py-3">
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-4">
          <!-- Progress -->
          <div
            v-if="progress"
            class="flex items-center gap-1 text-gray-700"
          >
            <span class="font-medium">{{ progress.actual }}</span>
            <span class="text-gray-400">/</span>
            <span class="font-medium">{{ progress.expected }}</span>
            <span class="text-gray-500">{{ $t('tasks.responses') }}</span>
          </div>

          <!-- Deadline -->
          <div
            v-if="deadline"
            class="text-orange-600"
          >
            ⏰ {{ deadline }}
          </div>
        </div>
      </div>

      <!-- Description -->
      <p
        v-if="description"
        class="mt-2 text-sm text-gray-600"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Coordinate interface (must match InteractiveMap.vue exactly)
interface Coordinates {
  lat: number
  lng: number
}

// Task location interface (must match InteractiveMap.vue exactly)
interface TaskLocation {
  _id?: string
  id?: string
  reference?: string
  nimi?: string
  name?: string
  kirjeldus?: string
  description?: string
  coordinates: Coordinates
}

// User position interface (must match InteractiveMap.vue exactly)
interface UserPosition {
  lat: number
  lng: number
  accuracy?: number
}

// Props
defineProps<{
  taskLocations?: TaskLocation[]
  userPosition?: UserPosition | null
  loadingLocations?: boolean
  selectedLocation?: TaskLocation | null
  visitedLocations?: Set<string>
  progress?: { actual: number, expected: number } | null
  deadline?: string | null
  description?: string | null
}>()

// Emits
const emit = defineEmits<{
  locationClick: [location: TaskLocation]
  mapReady: []
}>()

// Handle location clicks
const onLocationClick = (location: TaskLocation) => {
  emit('locationClick', location)
}

// Handle map ready event
const onMapReady = () => {
  emit('mapReady')
}
</script>
