<template>
  <div>
    <!-- Current Selection Display -->
    <div
      v-if="selectedLocation"
      class="mb-4 rounded-lg border border-green-200 bg-green-50 p-3"
    >
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-green-800">
            {{ t('taskDetail.selectedLocation') }}
          </h4>
          <p class="text-sm text-green-700">
            {{ getLocationName(selectedLocation) }}
          </p>
          <p
            v-if="selectedLocation.distanceText"
            class="text-xs text-green-600"
          >
            📍 {{ selectedLocation.distanceText }}
          </p>
        </div>
        <button
          type="button"
          class="text-sm text-green-600 hover:text-green-800"
          @click="clearSelection"
        >
          {{ t('taskDetail.changeLocation') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="py-4 text-center"
    >
      <div class="mx-auto size-6 animate-spin rounded-full border-b-2 border-blue-600" />
      <p class="mt-2 text-sm text-gray-600">
        {{ t('taskDetail.loadingLocationsList') }}
      </p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3"
    >
      <p class="text-sm text-red-800">
        {{ error }}
      </p>
      <button
        type="button"
        class="mt-2 text-xs text-red-600 underline hover:text-red-800"
        @click="$emit('retry')"
      >
        {{ t('taskDetail.retry') }}
      </button>
    </div>

    <!-- Location List -->
    <div
      v-else-if="sortedLocations.length > 0 && !selectedLocation"
      class="space-y-2"
    >
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-700">
          {{ t('taskDetail.selectLocation', { count: sortedLocations.length }) }}
        </h4>
        <span
          v-if="gettingLocation"
          class="text-xs text-gray-500"
        >
          {{ t('taskDetail.searchingLocationGPS') }}
        </span>
        <span
          v-else-if="userPosition"
          class="text-xs text-green-600"
        >
          📍 GPS sorted
        </span>
      </div>

      <!-- Search Filter -->
      <div
        v-if="sortedLocations.length > 5"
        class="mb-3"
      >
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('taskDetail.searchLocations')"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
      </div>

      <!-- Location Items -->
      <div class="max-h-60 space-y-1 overflow-y-auto">
        <button
          v-for="location in filteredLocations"
          :key="location._id || location.id"
          type="button"
          class="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          @click="selectLocation(location)"
        >
          <div class="flex-1">
            <h5 class="font-medium text-gray-900">
              {{ getLocationName(location) }}
            </h5>
            <p
              v-if="getLocationDescription(location)"
              class="text-sm text-gray-600"
            >
              {{ getLocationDescription(location) }}
            </p>
          </div>
          <div class="ml-3 text-right">
            <span
              v-if="location.distanceText"
              class="text-xs text-gray-500"
            >
              {{ location.distanceText }}
            </span>
            <div class="text-blue-600">
              →
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && sortedLocations.length === 0"
      class="py-6 text-center"
    >
      <div class="mb-2 text-gray-400">
        📍
      </div>
      <p class="text-sm text-gray-600">
        {{ t('taskDetail.noLocationsForTask') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const { t } = useI18n()
const { userPosition, gettingLocation, sortByDistance } = useLocation()

const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  selected: {
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
  }
})

const emit = defineEmits(['select', 'retry'])

// Local state
const searchQuery = ref('')

// Cache for sorted locations to prevent unnecessary re-renders
const sortedLocationsCache = ref([])
const lastUserPosition = ref(null)
const lastLocationsArray = ref(null)

// Helper to check if position has changed significantly
const hasPositionChangedSignificantly = (oldPos, newPos) => {
  if (!oldPos || !newPos) return true
  const threshold = 0.001 // ~100 meters
  return Math.abs(oldPos.lat - newPos.lat) > threshold
    || Math.abs(oldPos.lng - newPos.lng) > threshold
}

// Watch for changes and update cache
watch([() => props.locations, userPosition], ([newLocations, newPosition]) => {
  const locations = newLocations || []

  // Check if we need to update
  const needsUpdate = !lastLocationsArray.value
    || lastLocationsArray.value !== locations
    || !lastUserPosition.value
    || !newPosition
    || hasPositionChangedSignificantly(lastUserPosition.value, newPosition)

  if (needsUpdate) {
    let sortedLocs = [...locations]

    // If we have user position, sort by distance
    if (newPosition && locations.length > 0) {
      sortedLocs = sortByDistance(locations, newPosition)
    }

    // Update cache
    sortedLocationsCache.value = sortedLocs
    lastUserPosition.value = newPosition ? { ...newPosition } : null
    lastLocationsArray.value = locations
  }
}, { immediate: true })

// Computed
const selectedLocation = computed(() => props.selected)

const sortedLocations = computed(() => sortedLocationsCache.value)

const filteredLocations = computed(() => {
  if (!searchQuery.value) {
    return sortedLocations.value
  }

  const query = searchQuery.value.toLowerCase()
  return sortedLocations.value.filter((location) => {
    const name = getLocationName(location).toLowerCase()
    const description = getLocationDescription(location)?.toLowerCase() || ''
    return name.includes(query) || description.includes(query)
  })
})

// Methods
const selectLocation = (location) => {
  emit('select', location)
}

const clearSelection = () => {
  emit('select', null)
}

const getLocationName = (location) => {
  return (
    location.name?.[0]?.string
    || location.properties?.name?.[0]?.value
    || location.properties?.nimi?.[0]?.value
    || location.name
    || t('taskDetail.unnamedLocation')
  )
}

const getLocationDescription = (location) => {
  return (
    location.properties?.description?.[0]?.value
    || location.properties?.kirjeldus?.[0]?.value
    || location.description
    || null
  )
}

// Auto-request GPS on component mount for automatic location sorting
onMounted(() => {
  // GPS is automatically requested by the centralized useLocation service
  // No need for manual request - locations will auto-sort when GPS becomes available
  console.log('LocationPicker mounted - GPS auto-sort enabled')
})
</script>
