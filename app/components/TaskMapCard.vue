<template>
  <div class="flex size-full flex-col bg-white shadow-sm">
    <div class="flex-1">
      <InteractiveMap
        :locations="taskLocations"
        :user-position="effectiveUserPosition || undefined"
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

    <!-- Manual Location Override -->
    <div class="border-t">
      <div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
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
  </div>
</template>

<script setup lang="ts">
// Task location interface
interface TaskLocation {
  _id: string
  id?: string
  reference?: string
  name?: Array<{ string: string }>
  properties?: {
    name?: Array<{ value: string }>
  }
  lat?: Array<{ number: number }>
  long?: Array<{ number: number }>
  distanceText?: string
  [key: string]: unknown
}

// User position interface
interface UserPosition {
  lat: number
  lng: number
  accuracy?: number
  manual?: boolean
}

// Props
interface Props {
  taskLocations?: TaskLocation[]
  userPosition?: UserPosition | null
  loadingLocations?: boolean
  selectedLocation?: TaskLocation | null
  visitedLocations?: Set<string>
  progress?: { actual: number, expected: number } | null
  deadline?: string | null
  description?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  taskLocations: () => [],
  userPosition: null,
  loadingLocations: false,
  selectedLocation: null,
  visitedLocations: () => new Set(),
  progress: null,
  deadline: null,
  description: null
})

// Emits
interface Emits {
  (e: 'location-click', location: TaskLocation): void
  (e: 'map-ready'): void
  (e: 'location-change', coordinates: string | null): void
}

const emit = defineEmits<Emits>()

// Composables
const {
  setManualOverride
} = useLocation()

// Local state for manual override functionality
const showManualCoordinates = ref<boolean>(false)
const manualCoordinates = ref<string>('')
const hasManualOverride = ref<boolean>(false)

// Computed effective position (GPS or manual override)
const effectiveUserPosition = computed<UserPosition | null>(() => {
  if (hasManualOverride.value) {
    const parts = manualCoordinates.value.split(',').map((s) => s.trim())
    if (parts.length === 2 && parts[0] && parts[1]) {
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, accuracy: undefined, manual: true }
      }
    }
  }
  return props.userPosition || null
})

// Watch manual override state to control GPS updates
watch(hasManualOverride, (isManual: boolean) => {
  setManualOverride(isManual)
})

// Manual location override functions
const isValidCoordinates = (coords: string): boolean => {
  if (!coords || typeof coords !== 'string') return false

  const parts = coords.split(',').map((s) => s.trim())
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false

  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])

  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const applyManualLocation = (): void => {
  if (!isValidCoordinates(manualCoordinates.value)) return

  hasManualOverride.value = true
  showManualCoordinates.value = false

  // Emit manual coordinates to parent
  emit('location-change', manualCoordinates.value)
}

const clearManualLocation = (): void => {
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

const cancelManualEntry = (): void => {
  showManualCoordinates.value = false
  manualCoordinates.value = ''
}

// Start manual entry with prefilled coordinates
const startManualEntry = (): void => {
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
const onLocationClick = (location: TaskLocation): void => {
  emit('location-click', location)
}

// Handle map ready event
const onMapReady = (): void => {
  emit('map-ready')
}
</script>
