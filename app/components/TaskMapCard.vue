<template>
  <div class="rounded-lg border bg-white p-6 shadow-sm">
    <!-- Progress indicator -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">
        {{ $t('taskDetail.map') }}
      </h3>
      <div
        v-if="scoringData.totalExpected > 0"
        class="flex items-center space-x-2"
      >
        <div class="text-sm text-gray-600">
          Progress:
        </div>
        <div class="flex items-center space-x-1">
          <span class="font-semibold text-green-600">{{ scoringData.uniqueLocationsCount }}</span>
          <span class="text-gray-400">/</span>
          <span class="font-semibold text-gray-800">{{ scoringData.totalExpected }}</span>
        </div>
        <div class="text-xs text-gray-500">
          ({{ scoringData.progressPercent }}%)
        </div>
      </div>
    </div>

    <!-- Interactive Map -->
    <InteractiveMap
      :locations="taskLocations"
      :user-position="effectiveUserPosition"
      :visited-locations="scoringData.visitedLocations.value"
      :loading="loadingLocations"
      :max-locations="5"
      @location-click="onLocationClick"
      @map-ready="onMapReady"
    />

    <!-- Manual Location Override -->
    <div class="mt-4 border-t pt-4">
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-700">
          ✏️ {{ $t('taskDetail.manualLocationOverride') }}
        </h4>
        <button
          v-if="!showManualCoordinates"
          type="button"
          class="text-sm text-blue-600 hover:text-blue-800"
          @click="startManualEntry"
        >
          {{ $t('taskDetail.enterManually') }}
        </button>
        <button
          v-else
          type="button"
          class="text-sm text-gray-600 hover:text-gray-800"
          @click="cancelManualEntry"
        >
          {{ $t('taskDetail.cancel') }}
        </button>
      </div>

      <div
        v-if="showManualCoordinates"
        class="space-y-3"
      >
        <div>
          <label class="mb-2 block text-xs text-gray-600">
            {{ $t('taskDetail.coordinatesFormat') }}
          </label>
          <input
            v-model="manualCoordinates"
            type="text"
            :placeholder="$t('taskDetail.coordinatesExample')"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="applyManualLocation"
          >
          <p class="mt-1 text-xs text-gray-500">
            {{ $t('taskDetail.manualLocationHelp') }}
          </p>
        </div>

        <div class="flex space-x-2">
          <button
            type="button"
            :disabled="!isValidCoordinates(manualCoordinates)"
            class="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="applyManualLocation"
          >
            {{ $t('taskDetail.applyLocation') }}
          </button>
          <button
            type="button"
            class="rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
            @click="clearManualLocation"
          >
            {{ $t('taskDetail.clearOverride') }}
          </button>
        </div>
      </div>

      <div
        v-if="hasManualOverride && !showManualCoordinates"
        class="rounded-lg border border-amber-200 bg-amber-50 p-3"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-amber-800">
              ✏️ {{ $t('taskDetail.manualLocationActive') }}
            </p>
            <p class="mt-1 text-xs text-amber-600">
              {{ manualCoordinates }}
            </p>
          </div>
          <button
            type="button"
            class="text-sm text-amber-600 underline hover:text-amber-800"
            @click="clearManualLocation"
          >
            {{ $t('taskDetail.remove') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  /**
   * Task data for scoring
   */
  task: {
    type: Object,
    default: null
  },
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
   * Loading state for locations
   */
  loadingLocations: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['location-click', 'map-ready', 'location-change'])

// Composables
const {
  setManualOverride
} = useLocation()

// Task scoring composable
const scoringData = useTaskScoring(computed(() => props.task))

// Local state for manual override functionality
const showManualCoordinates = ref(false)
const manualCoordinates = ref('')
const hasManualOverride = ref(false)

// Computed effective position (GPS or manual override)
const effectiveUserPosition = computed(() => {
  if (hasManualOverride.value) {
    const parts = manualCoordinates.value.split(',').map((s) => s.trim())
    if (parts.length === 2) {
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, accuracy: undefined, manual: true }
      }
    }
  }
  return props.userPosition
})

// Watch manual override state to control GPS updates
watch(hasManualOverride, (isManual) => {
  setManualOverride(isManual)
})

// Manual location override functions
const isValidCoordinates = (coords) => {
  if (!coords || typeof coords !== 'string') return false

  const parts = coords.split(',').map((s) => s.trim())
  if (parts.length !== 2) return false

  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])

  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const applyManualLocation = () => {
  if (!isValidCoordinates(manualCoordinates.value)) return

  hasManualOverride.value = true
  showManualCoordinates.value = false

  // Emit manual coordinates to parent
  emit('location-change', manualCoordinates.value)
}

const clearManualLocation = () => {
  hasManualOverride.value = false
  manualCoordinates.value = ''
  showManualCoordinates.value = false

  // Reset to GPS position and emit it
  if (props.userPosition) {
    const gpsPos = props.userPosition
    const coordString = `${gpsPos.lat.toFixed(6)},${gpsPos.lng.toFixed(6)}`
    emit('location-change', coordString)
  }
  else {
    emit('location-change', null)
  }
}

const cancelManualEntry = () => {
  showManualCoordinates.value = false
  manualCoordinates.value = ''
}

// Start manual entry with prefilled coordinates
const startManualEntry = () => {
  // Prefill with current effective position if available
  if (effectiveUserPosition.value?.lat && effectiveUserPosition.value?.lng) {
    manualCoordinates.value = `${effectiveUserPosition.value.lat.toFixed(6)},${effectiveUserPosition.value.lng.toFixed(6)}`
  }
  else {
    // No location available, start with empty
    manualCoordinates.value = ''
  }

  showManualCoordinates.value = true
}

// Handle location clicks
const onLocationClick = (location) => {
  emit('location-click', location)
}

// Handle map ready event
const onMapReady = () => {
  emit('map-ready')
}
</script>
