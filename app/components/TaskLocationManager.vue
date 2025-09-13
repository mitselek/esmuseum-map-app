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
        <button
          type="button"
          class="mt-2 text-sm text-red-600 underline hover:text-red-800"
          @click="getCurrentLocation"
        >
          {{ $t('taskDetail.retry') }}
        </button>
      </div>

      <div
        v-else-if="userPosition"
        class="rounded-lg border border-green-200 bg-green-50 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-800">
              📍 {{ $t('taskDetail.locationDetected') }}
            </p>
            <p class="mt-1 text-xs text-green-600">
              {{ userPosition.lat.toFixed(6) }}, {{ userPosition.lng.toFixed(6) }}
              <span v-if="userPosition.accuracy">
                (±{{ Math.round(userPosition.accuracy) }}m)
              </span>
            </p>
          </div>
          <button
            type="button"
            class="text-sm text-green-600 underline hover:text-green-800"
            @click="getCurrentLocation"
          >
            {{ $t('taskDetail.refresh') }}
          </button>
        </div>
      </div>

      <div
        v-else
        class="rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <button
          type="button"
          class="flex items-center text-sm text-blue-600 hover:text-blue-800"
          @click="getCurrentLocation"
        >
          📍 {{ $t('taskDetail.detectLocation') }}
        </button>
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

interface Coordinates {
  lat: number
  lng: number
  accuracy?: number
  manual?: boolean
}

interface GeolocationCoords {
  latitude: number
  longitude: number
  accuracy: number
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// Local state - manage location independently for now
const geolocationLoading = ref(false)
const geolocationError = ref<string | null>(null)
const userPosition = ref<Coordinates | null>(null)
const userLocation = ref<GeolocationCoords | null>(null)
const showManualCoordinates = ref(false)
const manualCoordinates = ref('')
const hasManualOverride = ref(false)

// Geolocation functionality
const getCurrentLocation = async () => {
  if (!navigator.geolocation) {
    geolocationError.value = t('taskDetail.geolocationNotSupported')
    return false
  }

  geolocationLoading.value = true
  geolocationError.value = null

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }

        // Save detected location separately for restoration
        userLocation.value = coords

        // Update user position (unless manually overridden)
        if (!hasManualOverride.value) {
          userPosition.value = {
            lat: coords.latitude,
            lng: coords.longitude,
            accuracy: coords.accuracy
          }
        }

        // Emit coordinates to parent
        const coordString = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`
        emit('locationChange', coordString)

        geolocationLoading.value = false
        resolve(coords)
      },
      (error) => {
        let errorMessage = t('taskDetail.geolocationError', { error: error.message })

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied geolocation permission'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        geolocationError.value = errorMessage
        geolocationLoading.value = false
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

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

  const parts = manualCoordinates.value.split(',').map((s) => s.trim())
  const lat = parseFloat(parts[0]!)
  const lng = parseFloat(parts[1]!)

  // Override user position with manual coordinates
  userPosition.value = { lat, lng, accuracy: undefined, manual: true }
  hasManualOverride.value = true
  showManualCoordinates.value = false

  // Emit coordinates to parent
  emit('locationChange', manualCoordinates.value)

  // Re-sort locations with new position (TODO: implement sorting if needed)
  // if (taskLocations.value.length > 0) {
  //   taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
  // }
}

const clearManualLocation = () => {
  hasManualOverride.value = false
  manualCoordinates.value = ''
  showManualCoordinates.value = false

  // Reset to detected GPS position if available
  if (userLocation.value) {
    userPosition.value = {
      lat: userLocation.value.latitude,
      lng: userLocation.value.longitude,
      accuracy: userLocation.value.accuracy
    }

    // Emit GPS coordinates to parent
    const coordString = `${userLocation.value.latitude.toFixed(6)},${userLocation.value.longitude.toFixed(6)}`
    emit('locationChange', coordString)
  }
  else {
    userPosition.value = null
    emit('locationChange', null)
  }

  // Re-sort locations (TODO: implement sorting if needed)
  // if (taskLocations.value.length > 0 && userPosition.value) {
  //   taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
  // }
}

const cancelManualEntry = () => {
  showManualCoordinates.value = false
  manualCoordinates.value = ''
}

// Start manual entry with prefilled coordinates
const startManualEntry = () => {
  // Prefill with current user position if available
  if (userPosition.value && userPosition.value.lat && userPosition.value.lng) {
    manualCoordinates.value = `${userPosition.value.lat.toFixed(6)},${userPosition.value.lng.toFixed(6)}`
  }
  else if (userLocation.value) {
    // Fallback to detected GPS location
    manualCoordinates.value = `${userLocation.value.latitude.toFixed(6)},${userLocation.value.longitude.toFixed(6)}`
  }
  else {
    // No location available, start with empty
    manualCoordinates.value = ''
  }

  showManualCoordinates.value = true
}
</script>
