<template>
  <div
    v-if="hasMapData"
    class="rounded-lg border bg-white p-6 shadow-sm"
  >
    <h3 class="mb-4 text-lg font-medium text-gray-900">
      📍 {{ $t('taskDetail.yourLocation') }}
    </h3>

    <!-- Current Location Status -->
    <div class="mb-4">
      <div
        v-if="geolocationLoading"
        class="rounded-lg border border-blue-200 bg-blue-50 p-4"
      >
        <div class="flex items-center">
          <div class="mr-3 size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p class="text-sm text-blue-800">
            {{ $t('taskDetail.searchingLocationGPS') }}
          </p>
        </div>
      </div>

      <div
        v-else-if="geolocationError"
        class="rounded-lg border border-red-200 bg-red-50 p-4"
      >
        <p class="text-sm text-red-800">
          ⚠️ {{ geolocationError }}
        </p>
        <p class="mt-1 text-xs text-red-600">
          {{ $t('taskDetail.locationPermissionHelp') }}
        </p>
      </div>

      <div
        v-else-if="effectiveUserPosition"
        class="rounded-lg border border-green-200 bg-green-50 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-800">
              📍 {{ $t('taskDetail.locationDetected') }}
            </p>
            <p class="mt-1 text-xs text-green-600">
              {{ effectiveUserPosition.lat.toFixed(6) }}, {{ effectiveUserPosition.lng.toFixed(6) }}
              <span v-if="effectiveUserPosition.accuracy">
                (±{{ Math.round(effectiveUserPosition.accuracy) }}m)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <p class="text-sm text-gray-600">
          📍 {{ $t('taskDetail.detectingLocation') }}
        </p>
        <p class="mt-1 text-xs text-gray-500">
          {{ $t('taskDetail.detectLocationHelp') }}
        </p>
      </div>
    </div>

    <!-- Manual Location Override -->
    <div class="border-t pt-4">
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

<script setup lang="ts">
interface Props {
  hasMapData: boolean
}

interface Emits {
  (e: 'locationChange', coordinates: string | null): void
}

interface _Coordinates {
  lat: number
  lng: number
  accuracy?: number
  manual?: boolean
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const {
  userPosition,
  gettingLocation,
  locationError,
  setManualOverride
} = useLocation()

// Local state for manual override functionality
const showManualCoordinates = ref(false)
const manualCoordinates = ref('')
const hasManualOverride = ref(false)

// Map centralized GPS state to local display state
const geolocationLoading = computed(() => gettingLocation.value)
const geolocationError = computed(() => locationError.value)

// Computed effective position (GPS or manual override)
const effectiveUserPosition = computed(() => {
  if (hasManualOverride.value) {
    const parts = manualCoordinates.value.split(',').map((s) => s.trim())
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]!)
      const lng = parseFloat(parts[1]!)
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, accuracy: undefined, manual: true }
      }
    }
  }
  return userPosition.value
})

// Watch for GPS position changes and emit to parent
const lastEmittedPosition = ref<string | null>(null)

watch(effectiveUserPosition, (newPosition) => {
  if (newPosition && !hasManualOverride.value) {
    const coordString = `${newPosition.lat.toFixed(6)},${newPosition.lng.toFixed(6)}`

    // Only emit if position has changed significantly (prevent recursive updates)
    if (lastEmittedPosition.value !== coordString) {
      lastEmittedPosition.value = coordString
      emit('locationChange', coordString)
    }
  }
}, { immediate: false }) // Don't emit immediately on mount

// Watch manual override state to control GPS updates
watch(hasManualOverride, (isManual) => {
  setManualOverride(isManual)
})

// Manual location override functions
const isValidCoordinates = (coords: string) => {
  if (!coords || typeof coords !== 'string') return false

  const parts = coords.split(',').map((s) => s.trim())
  if (parts.length !== 2) return false

  const lat = parseFloat(parts[0]!)
  const lng = parseFloat(parts[1]!)

  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const applyManualLocation = () => {
  if (!isValidCoordinates(manualCoordinates.value)) return

  hasManualOverride.value = true
  showManualCoordinates.value = false

  // Emit manual coordinates to parent
  emit('locationChange', manualCoordinates.value)
}

const clearManualLocation = () => {
  hasManualOverride.value = false
  manualCoordinates.value = ''
  showManualCoordinates.value = false

  // Reset to GPS position and emit it
  if (userPosition.value) {
    const gpsPos = userPosition.value as { lat: number, lng: number }
    const coordString = `${gpsPos.lat.toFixed(6)},${gpsPos.lng.toFixed(6)}`
    emit('locationChange', coordString)
  }
  else {
    emit('locationChange', null)
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
</script>
