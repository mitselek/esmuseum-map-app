<template>
  <div class="rounded-lg border bg-white p-6 shadow-sm">
    <h3 class="mb-4 text-lg font-medium text-gray-900">
      {{ $t('taskDetail.map') }}
    </h3>

    <!-- Interactive Map -->
    <InteractiveMap
      :locations="taskLocations"
      :user-position="userPosition"
      :completed-tasks="completedTasks"
      :loading="loadingLocations"
      :max-locations="5"
      @location-click="onLocationClick"
      @map-ready="onMapReady"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  /**
   * Array of task locations to display
   */
  taskLocations: {
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
   * Array of completed task IDs
   */
  completedTasks: {
    type: Array,
    default: () => []
  },
  /**
   * Loading state for locations
   */
  loadingLocations: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['location-click', 'map-ready'])

// Handle location clicks
const onLocationClick = (location) => {
  emit('location-click', location)
}

// Handle map ready event
const onMapReady = () => {
  emit('map-ready')
}
</script>
