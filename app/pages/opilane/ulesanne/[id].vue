<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="border-b bg-white shadow-sm">
      <div class="px-4 py-3">
        <div class="flex items-center">
          <button
            class="mr-3 text-gray-600 hover:text-gray-900"
            @click="goBack"
          >
            ← Tagasi
          </button>
          <h1 class="text-lg font-semibold text-gray-900">
            {{ taskTitle }}
          </h1>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex items-center justify-center py-8"
    >
      <div class="size-8 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-4"
    >
      <div class="rounded-lg border border-red-200 bg-red-50 p-4">
        <p class="text-red-800">
          {{ error }}
        </p>
        <button
          class="mt-2 text-sm text-red-600 underline hover:text-red-800"
          @click="loadTask"
        >
          Proovi uuesti
        </button>
      </div>
    </div>

    <!-- Task Content -->
    <main
      v-else-if="task"
      class="p-4"
    >
      <!-- Task Info Card -->
      <div class="mb-4 rounded-lg border bg-white p-4 shadow-sm">
        <h2 class="mb-2 text-xl font-semibold text-gray-900">
          {{ getTaskTitle(task) }}
        </h2>

        <div
          v-if="getTaskDescription(task)"
          class="mb-4 text-gray-700"
        >
          <p class="whitespace-pre-wrap">
            {{ getTaskDescription(task) }}
          </p>
        </div>

        <!-- Task Metadata -->
        <div class="space-y-2 text-sm text-gray-600">
          <div
            v-if="getTaskGroup(task)"
            class="flex items-center"
          >
            <span class="mr-2">👥</span>
            <span>Grupp: {{ getTaskGroup(task) }}</span>
          </div>
          <div class="flex items-center">
            <span class="mr-2">📊</span>
            <span>Vastuseid kokku: {{ getResponseCount(task) }}</span>
          </div>
          <div
            v-if="getUserResponse()"
            class="flex items-center"
          >
            <span class="mr-2">✅</span>
            <span class="text-green-600">Sinu vastus on esitatud</span>
          </div>
        </div>
      </div>

      <!-- Map Card (if task has location data) -->
      <div
        v-if="hasMapData"
        class="mb-4 rounded-lg border bg-white p-4 shadow-sm"
      >
        <h3 class="mb-3 text-lg font-medium text-gray-900">
          Kaart
        </h3>
        <div class="rounded-lg bg-gray-100 p-8 text-center">
          <div class="text-gray-500">
            🗺️
          </div>
          <p class="mt-2 text-sm text-gray-600">
            Kaardi integratsioon tuleb hiljem
          </p>
        </div>
      </div>

      <!-- Response Form -->
      <div class="rounded-lg border bg-white p-4 shadow-sm">
        <h3 class="mb-4 text-lg font-medium text-gray-900">
          {{ getUserResponse() ? 'Sinu vastus' : 'Esita vastus' }}
        </h3>

        <form @submit.prevent="submitResponse">
          <!-- File Upload -->
          <div class="mb-4">
            <label
              for="response-file"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Lisa fail (valikuline)
            </label>
            <input
              id="response-file"
              ref="fileInput"
              type="file"
              class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              accept="image/*,.pdf,.doc,.docx"
              :disabled="submitting"
              @change="handleFileSelect"
            >
            <p class="mt-1 text-xs text-gray-500">
              Lubatud: pildid, PDF, Word dokumendid
            </p>
          </div>

          <!-- Location Selection -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Asukoht
            </label>

            <!-- Location Picker Component -->
            <LocationPicker
              :locations="mapLocations"
              :user-position="userPosition"
              :selected="selectedLocation"
              :loading="loadingLocations"
              :error="locationError"
              @select="onLocationSelect"
              @manual="showManualCoordinates = true"
              @request-location="onRequestLocation"
              @retry="loadLocations"
            />

            <!-- Manual Coordinate Entry (fallback) -->
            <div
              v-if="showManualCoordinates"
              class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div class="mb-3 flex items-center justify-between">
                <h4 class="text-sm font-medium text-gray-700">
                  Käsitsi koordinaadid
                </h4>
                <button
                  type="button"
                  class="text-sm text-gray-600 hover:text-gray-800"
                  @click="showManualCoordinates = false"
                >
                  ✕ Sulge
                </button>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs text-gray-600">
                    Koordinaadid (lat,lng formaat)
                  </label>
                  <input
                    v-model="manualCoordinates"
                    type="text"
                    placeholder="näiteks: 59.4370, 24.7536"
                    class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    :disabled="submitting"
                  >
                </div>

                <div class="flex space-x-2">
                  <button
                    type="button"
                    class="text-sm text-blue-600 hover:text-blue-800"
                    :disabled="gettingLocation || submitting"
                    @click="getCurrentLocation"
                  >
                    {{ gettingLocation ? 'Otsin asukohta...' : 'Kasuta praegust asukohta' }}
                  </button>

                  <button
                    type="button"
                    class="text-sm text-green-600 hover:text-green-800"
                    :disabled="!manualCoordinates || submitting"
                    @click="useManualCoordinates"
                  >
                    Kasuta neid koordinaate
                  </button>
                </div>
              </div>
            </div>

            <!-- Current Selection Display -->
            <div
              v-if="responseForm.geopunkt && !showManualCoordinates"
              class="mt-2 rounded-lg bg-green-50 p-3"
            >
              <p class="text-sm text-green-800">
                📍 Asukoht määratud: {{ formatDisplayCoordinates(responseForm.geopunkt) }}
              </p>
            </div>
          </div>

          <!-- Text Response -->
          <div class="mb-4">
            <label
              for="response-text"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Vastus
            </label>
            <textarea
              id="response-text"
              v-model="responseForm.text"
              class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="4"
              placeholder="Kirjuta oma vastus siia..."
              :disabled="submitting"
            />
          </div>

          <!-- Submit Button -->
          <div class="flex flex-col space-y-2">
            <button
              type="submit"
              class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!canSubmit || submitting"
            >
              {{ submitting ? 'Esitan...' : (getUserResponse() ? 'Uuenda vastust' : 'Esita vastus') }}
            </button>

            <div
              v-if="getUserResponse()"
              class="text-center"
            >
              <p class="text-xs text-gray-500">
                Saad oma vastust muuta kuni tähtaja lõpuni
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'pupil-auth'
})

const route = useRoute()
const { user } = useEntuAuth()
const { getEntity, createEntity, updateEntity } = useEntuApi()
const {
  userPosition,
  locationError,
  getUserPosition,
  requestGPSOnLoad,
  loadTaskLocations,
  sortByDistance,
  formatCoordinates,
  getLocationCoordinates
} = useLocation()

// Reactive data
const task = ref(null)
const userResponse = ref(null)
const pending = ref(true)
const error = ref(null)
const submitting = ref(false)
const gettingLocation = ref(false)

// Location-related state
const mapLocations = ref([])
const loadingLocations = ref(false)
const selectedLocation = ref(null)
const showManualCoordinates = ref(false)
const manualCoordinates = ref('')

// Form data
const responseForm = ref({
  text: '',
  file: null,
  geopunkt: ''
})

// File input ref
const fileInput = ref(null)

// Computed properties
const taskTitle = computed(() => {
  return task.value ? getTaskTitle(task.value) : 'Laen...'
})

const hasMapData = computed(() => {
  // Check if task has map/location related properties
  return task.value?.properties?.kaart || task.value?.properties?.coordinates
})

const canSubmit = computed(() => {
  return responseForm.value.text.trim().length > 0 || responseForm.value.file
})

// Watch for GPS position changes and reorder locations
watch(userPosition, (newPosition) => {
  if (newPosition && mapLocations.value.length > 0) {
    console.log('GPS position updated, reordering locations by distance')
    mapLocations.value = sortByDistance(mapLocations.value, newPosition)
  }
}, { deep: true })

// Methods
const goBack = () => {
  navigateTo('/opilane')
}

const loadTask = async () => {
  try {
    pending.value = true
    error.value = null

    const taskId = route.params.id
    if (!taskId) {
      throw new Error('Ülesande ID puudub')
    }

    // Load task details
    const taskResponse = await getEntity(taskId)
    task.value = taskResponse.entity

    // Load user's existing response if any
    await loadUserResponse()

    // Load map locations for this task
    await loadLocations()

    // Request GPS position in background (non-blocking)
    requestGPSOnLoad()
  }
  catch (err) {
    console.error('Error loading task:', err)
    error.value = err.message || 'Viga ülesande laadimisel'
  }
  finally {
    pending.value = false
  }
}

const loadLocations = async () => {
  try {
    loadingLocations.value = true

    if (!task.value) {
      console.log('No task available for loading locations')
      return
    }

    // Load locations for this task's map
    const locations = await loadTaskLocations(task.value)
    console.log('Loaded locations:', locations)

    // Sort by distance if we have user position
    if (userPosition.value) {
      mapLocations.value = sortByDistance(locations, userPosition.value)
    }
    else {
      mapLocations.value = locations
    }
  }
  catch (err) {
    console.error('Error loading locations:', err)
    // Don't show error to user - just log it and continue without locations
    mapLocations.value = []
  }
  finally {
    loadingLocations.value = false
  }
}

const loadUserResponse = async () => {
  try {
    // TODO: Implement loading user's existing response
    // This will query vastus entities where person=currentUser and ulesanne=currentTask
    userResponse.value = null

    // If response exists, populate form
    if (userResponse.value) {
      responseForm.value.text = getUserResponseText()
      responseForm.value.geopunkt = getUserResponseLocation()
    }
  }
  catch (err) {
    console.warn('Could not load user response:', err)
  }
}

const submitResponse = async () => {
  try {
    submitting.value = true

    const responseData = {
      text: responseForm.value.text,
      geopunkt: responseForm.value.geopunkt,
      ulesanne: task.value.id,
      person: user.value.id
    }

    if (userResponse.value) {
      // Update existing response
      await updateEntity(userResponse.value.id, responseData)
    }
    else {
      // Create new response
      await createEntity('vastus', responseData)
    }

    // Show success message
    alert('Vastus on edukalt esitatud!')

    // Reload response data
    await loadUserResponse()
  }
  catch (err) {
    console.error('Error submitting response:', err)
    alert('Viga vastuse esitamisel: ' + (err.message || 'Tundmatu viga'))
  }
  finally {
    submitting.value = false
  }
}

const getCurrentLocation = () => {
  gettingLocation.value = true

  if (!navigator.geolocation) {
    alert('Geolokatsioon pole selles brauseris toetatud')
    gettingLocation.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const coordinates = `${latitude},${longitude}`

      if (showManualCoordinates.value) {
        // Update manual input field
        manualCoordinates.value = coordinates
      }
      else {
        // Direct assignment to form
        responseForm.value.geopunkt = coordinates
        selectedLocation.value = null
      }

      gettingLocation.value = false
    },
    (err) => {
      console.error('Geolocation error:', err)
      alert('Asukoha määramisel tekkis viga: ' + err.message)
      gettingLocation.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  responseForm.value.file = file
}

// Location-related methods
const onLocationSelect = (location) => {
  selectedLocation.value = location
  if (location) {
    responseForm.value.geopunkt = getLocationCoordinates(location)
    showManualCoordinates.value = false
  }
  else {
    responseForm.value.geopunkt = ''
  }
}

const onRequestLocation = async () => {
  try {
    gettingLocation.value = true
    await getUserPosition()

    // Re-sort locations by distance
    if (mapLocations.value.length > 0) {
      mapLocations.value = sortByDistance(mapLocations.value, userPosition.value)
    }
  }
  catch (err) {
    console.error('Error getting user position:', err)
    // Error is already handled by the composable
  }
  finally {
    gettingLocation.value = false
  }
}

const useManualCoordinates = () => {
  if (manualCoordinates.value) {
    responseForm.value.geopunkt = manualCoordinates.value
    selectedLocation.value = null
    showManualCoordinates.value = false
  }
}

const formatDisplayCoordinates = (geopunkt) => {
  return formatCoordinates(geopunkt)
}

// Helper methods for task data
const getTaskTitle = (task) => {
  return task.properties?.title?.[0]?.value
    || task.properties?.name?.[0]?.value
    || task.properties?.pealkiri?.[0]?.value
    || 'Nimetu ülesanne'
}

const getTaskDescription = (task) => {
  return task.properties?.description?.[0]?.value
    || task.properties?.kirjeldus?.[0]?.value
    || task.properties?.sisu?.[0]?.value
    || null
}

const getResponseCount = (task) => {
  return task.properties?.vastuseid?.[0]?.value || 0
}

const getTaskGroup = (task) => {
  const gruppRef = task.properties?.grupp?.[0]
  if (gruppRef?.reference_id) {
    return gruppRef.reference_displayname || 'Grupp'
  }
  return null
}

const getUserResponse = () => {
  return userResponse.value
}

const getUserResponseText = () => {
  return userResponse.value?.properties?.text?.[0]?.value || ''
}

const getUserResponseLocation = () => {
  return userResponse.value?.properties?.geopunkt?.[0]?.value || ''
}

// Load task on mount
onMounted(() => {
  loadTask()
})

// Set page title
useHead({
  title: taskTitle
})
</script>
