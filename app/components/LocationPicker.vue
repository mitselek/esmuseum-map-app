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
            v-if="formatDistance(selectedLocation.distance)"
            class="text-xs text-green-600"
          >
            📍 {{ formatDistance(selectedLocation.distance) }}
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
      <div class="mx-auto size-6 animate-spin rounded-full border-b-2 border-esm-blue" />
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
        {{ $t('common.retry') }}
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
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-esm-blue focus:outline-none focus:ring-1 focus:ring-esm-blue"
        >
      </div>

      <!-- Location Items -->
      <div class="space-y-1">
        <button
          v-for="location in filteredLocations"
          :key="location._id"
          type="button"
          :class="[
            'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
            isLocationSelected(location)
              ? 'border-esm-blue bg-esm-beige ring-2 ring-esm-blue hover:bg-esm-light'
              : 'border-gray-200 bg-white hover:bg-gray-50 focus:border-esm-blue focus:ring-esm-blue',
          ]"
          @click="selectLocation(location)"
        >
          <div class="flex-1">
            <h5 class="font-medium text-esm-dark">
              {{ getLocationName(location) }}
            </h5>
            <p
              v-if="getLocationDescription(location)"
              class="text-sm text-gray-600"
            >
              {{ getLocationDescription(location) }}
            </p>
          </div>
          <div class="ml-3 flex items-center text-right">
            <div
              v-if="!location.coordinates"
              class="mr-2"
            >
              <span class="text-xs italic text-gray-400">
                Koordinaadid puuduvad
              </span>
            </div>
            <div
              v-else-if="formatDistance(location.distance)"
              class="mr-2"
            >
              <span class="text-xs text-gray-500">
                {{ formatDistance(location.distance) }}
              </span>
            </div>
            <div
              v-if="isLocationVisited(location)"
              class="text-lg text-green-600"
            >
              ✓
            </div>
            <div
              v-else
              class="text-esm-blue"
            >
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

<script setup lang="ts">
import { isSameLocation } from '~/utils/location-sync'
import type { TaskLocation } from '~~/types/location'

const log = useClientLogger('LocationPicker')

const { t } = useI18n()
const { userPosition, gettingLocation, sortByDistance } = useLocation()

// User position interface
interface UserPosition {
  lat: number
  lng: number
  accuracy?: number
}

// Props
interface Props {
  locations?: TaskLocation[]
  selected?: TaskLocation | null
  loading?: boolean
  error?: string | null
  visitedLocations?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  locations: () => [],
  selected: null,
  loading: false,
  error: null,
  visitedLocations: () => new Set()
})

// Emits
interface Emits {
  (e: 'select', location: TaskLocation | null): void
  (e: 'retry'): void
}

const emit = defineEmits<Emits>()

// Local state
const searchQuery = ref<string>('')

// Cache for sorted locations to prevent unnecessary re-renders
const sortedLocationsCache = ref<TaskLocation[]>([])
const lastUserPosition = ref<UserPosition | null>(null)
const lastLocationsArray = ref<TaskLocation[] | null>(null)

// Helper to check if position has changed significantly
const hasPositionChangedSignificantly = (oldPos: UserPosition | null, newPos: UserPosition | null): boolean => {
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
    || hasPositionChangedSignificantly(lastUserPosition.value, newPosition as UserPosition | null)

  if (needsUpdate) {
    let sortedLocs: TaskLocation[] = [...locations]

    // If we have user position, sort by distance
    if (newPosition && locations.length > 0) {
      sortedLocs = sortByDistance(locations, newPosition) as TaskLocation[]
    }

    // Update cache
    sortedLocationsCache.value = sortedLocs
    lastUserPosition.value = newPosition ? { ...newPosition } : null
    lastLocationsArray.value = locations
  }
}, { immediate: true })

// Computed
const selectedLocation = computed<TaskLocation | null>(() => props.selected)

// Debug: Watch selected prop changes
watch(() => props.selected, (newSelected: TaskLocation | null | undefined, oldSelected: TaskLocation | null | undefined) => {
  const getDebugName = (loc: TaskLocation | null | undefined): string => {
    if (!loc) return 'null'
    return loc.name || 'null'
  }
  log.debug('[LocationPicker] selected prop changed:', {
    from: getDebugName(oldSelected),
    to: getDebugName(newSelected)
  })
}, { deep: true })

// Check if a location is currently selected
const isLocationSelected = (location: TaskLocation): boolean => {
  if (!selectedLocation.value || !location) return false
  return isSameLocation(location, selectedLocation.value)
}

// Check if a location is visited
const isLocationVisited = (location: TaskLocation): boolean => {
  if (!location._id || !props.visitedLocations) return false
  return props.visitedLocations.has(location._id)
}

const sortedLocations = computed<TaskLocation[]>(() => sortedLocationsCache.value)

const filteredLocations = computed<TaskLocation[]>(() => {
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
const selectLocation = (location: TaskLocation): void => {
  emit('select', location)
}

const clearSelection = (): void => {
  emit('select', null)
}

const formatDistance = (distance: number | undefined): string | null => {
  if (distance == null || !isFinite(distance)) return null
  // Distance is in kilometers (from calculateDistance/Haversine)
  if (distance < 0.01) return 'Väga lähedal'
  if (distance < 1) return `${Math.round(distance * 1000)} m`
  if (distance < 10) return `${distance.toFixed(1)} km`
  return `${Math.round(distance)} km`
}

const getLocationName = (location: TaskLocation): string => {
  return location.name || t('taskDetail.unnamedLocation')
}

const getLocationDescription = (location: TaskLocation): string | null => {
  return location.description || null
}

// Auto-request GPS on component mount for automatic location sorting
onMounted(() => {
  // GPS is automatically requested by the centralized useLocation service
  // No need for manual request - locations will auto-sort when GPS becomes available
})
</script>
