<template>
  <div class="flex h-full flex-col">
    <!-- No task selected -->
    <TaskEmptyState v-if="!selectedTask" />

    <!-- Task selected -->
    <div
      v-else
      class="flex h-full flex-col"
    >
      <!-- Task header -->
      <TaskHeader
        :selected-task="selectedTask"
        :task-title="getTaskTitle(selectedTask)"
        :task-description="getTaskDescription(selectedTask)"
        :response-count="getResponseCount(selectedTask)"
        :task-response-stats="taskResponseStats"
        @clear-selection="clearSelection"
      />

      <!-- Task content -->
      <div class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div class="mx-auto max-w-4xl space-y-6">
          <!-- Map Card (if task has location data) -->
          <TaskMapCard v-if="hasMapData" />

          <!-- User Location Override -->
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

          <!-- Response Form -->
          <div class="rounded-lg border bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-lg font-medium text-gray-900">
              {{ $t('taskDetail.yourResponse') }}
            </h3>

            <!-- Permission checking state -->
            <div
              v-if="checkingPermissions"
              class="flex items-center justify-center py-8"
            >
              <div class="text-center">
                <div class="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                <p class="text-sm text-gray-500">
                  {{ $t('taskDetail.checkingPermissions') }}
                </p>
              </div>
            </div>

            <!-- No permissions message -->
            <TaskNoPermission v-else-if="!hasResponsePermission" />

            <!-- Response form (shown only with permission) -->
            <form
              v-else
              @submit.prevent="submitResponse"
            >
              <!-- Location Selection (if needed) -->
              <div
                v-if="needsLocation"
                class="mb-6"
              >
                <label class="mb-3 block text-sm font-medium text-gray-700">
                  {{ $t('taskDetail.location') }}
                </label>

                <!-- LocationPicker Component -->
                <LocationPicker
                  :locations="taskLocations"
                  :user-position="userPosition"
                  :selected="selectedLocation"
                  :loading="loadingTaskLocations"
                  :error="geolocationError"
                  @select="onLocationSelect"
                  @request-location="onRequestLocation"
                  @retry="loadTaskLocations"
                />
              </div>

              <!-- Text Response -->
              <div class="mb-6">
                <label
                  for="response-text"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  {{ $t('taskDetail.response') }}
                </label>
                <textarea
                  id="response-text"
                  v-model="responseForm.text"
                  class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="4"
                  :placeholder="$t('taskDetail.responsePlaceholder')"
                  :disabled="submitting"
                />
              </div>

              <!-- File Upload -->
              <div class="mb-6">
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  {{ $t('taskDetail.addFile') }}
                </label>
                <div class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                  <p class="text-sm text-gray-500">
                    📎 {{ $t('taskDetail.allowedFiles') }}
                  </p>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="flex flex-col space-y-2">
                <button
                  type="submit"
                  class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!canSubmit || submitting"
                >
                  {{ submitting ? $t('taskDetail.submitting') : $t('taskDetail.submitResponseBtn') }}
                </button>

                <p class="text-center text-xs text-gray-500">
                  {{ $t('taskDetail.canUpdateUntilDeadline') }}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { selectedTask, clearSelection } = useTaskWorkspace()
const { t } = useI18n()
const {
  userPosition,
  getUserPosition,
  loadTaskLocations: loadMapLocations,
  sortByDistance,
  getLocationCoordinates
} = useLocation()
const { getTaskResponseStats } = useTaskResponseStats()

// Response stats state
const taskResponseStats = ref(null)

// Form state
const responseForm = ref({
  text: '',
  geopunkt: null,
  file: null
})

const submitting = ref(false)
const checkingPermissions = ref(false)
const hasResponsePermission = ref(false)

// Geolocation state
const geolocationLoading = ref(false)
const geolocationError = ref(null)
const userLocation = ref(null)

// Task locations state
const taskLocations = ref([])
const loadingTaskLocations = ref(false)
const selectedLocation = ref(null)
const showManualCoordinates = ref(false)
const manualCoordinates = ref('')
const hasManualOverride = ref(false)

// Helper functions (matching existing task detail page)
const getTaskTitle = (task) => {
  // Handle both data structures: task.name (string) or task.name[0].string (array format)
  if (typeof task?.name === 'string') {
    return task.name || t('taskDetail.noTitle', 'Untitled Task')
  }
  return task?.name?.[0]?.string || t('taskDetail.noTitle', 'Untitled Task')
}

const getTaskDescription = (task) => {
  return task?.description?.[0]?.string || task?.description || null
}

const getResponseCount = (task) => {
  // Handle Entu array format for response count
  if (task?.vastuseid && Array.isArray(task.vastuseid) && task.vastuseid[0]?.number !== undefined) {
    return task.vastuseid[0].number
  }
  // Fallback for direct number
  if (typeof task?.responseCount === 'number') {
    return task.responseCount
  }
  return 0
}

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

        // Set the coordinates in the response form
        responseForm.value.geopunkt = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`

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

// Load locations for current task
const loadTaskLocations = async () => {
  if (!selectedTask.value) {
    taskLocations.value = []
    return
  }

  try {
    loadingTaskLocations.value = true

    const locations = await loadMapLocations(selectedTask.value)

    // Sort by distance if we have user position
    if (userPosition.value) {
      taskLocations.value = sortByDistance(locations, userPosition.value)
    }
    else {
      taskLocations.value = locations
    }
  }
  catch (err) {
    console.error('Error loading task locations:', err)
    taskLocations.value = []
  }
  finally {
    loadingTaskLocations.value = false
  }
}

// Handle location selection from LocationPicker
const onLocationSelect = (location) => {
  selectedLocation.value = location
  if (location) {
    responseForm.value.geopunkt = getLocationCoordinates(location)
    showManualCoordinates.value = false
  }
  else {
    responseForm.value.geopunkt = null
  }
}

// Handle location request from LocationPicker
const onRequestLocation = async () => {
  try {
    geolocationLoading.value = true
    await getUserPosition()

    // Re-sort locations by distance if we have them
    if (taskLocations.value.length > 0) {
      taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
    }
  }
  catch (err) {
    console.error('Error getting user position:', err)
    geolocationError.value = err.message
  }
  finally {
    geolocationLoading.value = false
  }
}

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

  const parts = manualCoordinates.value.split(',').map((s) => s.trim())
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])

  // Override user position with manual coordinates
  userPosition.value = { lat, lng, accuracy: null, manual: true }
  hasManualOverride.value = true
  showManualCoordinates.value = false

  // Re-sort locations with new position
  if (taskLocations.value.length > 0) {
    taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
  }
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
  }
  else {
    userPosition.value = null
  }

  // Re-sort locations
  if (taskLocations.value.length > 0 && userPosition.value) {
    taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
  }
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

// Check if task needs location
const hasMapData = computed(() => {
  // For now, assume all tasks might have location data
  return !!selectedTask.value
})

const needsLocation = computed(() => {
  // Check if task requires location input
  return !!selectedTask.value && hasMapData.value
})

const canSubmit = computed(() => {
  return responseForm.value.text.trim().length > 0
})

// Form submission
const submitResponse = async () => {
  if (!canSubmit.value || !selectedTask.value) return

  submitting.value = true

  try {
    const { token } = useEntuAuth()

    if (!token.value) {
      console.error('Not authenticated')
      return
    }

    // Prepare the API request data matching the server validation
    const requestData = {
      taskId: selectedTask.value._id,
      responses: [
        {
          questionId: 'default', // Using default for simple text response
          type: 'text',
          value: responseForm.value.text,
          metadata: {}
        }
      ]
    }

    // Call the API endpoint
    await $fetch('/api/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: requestData
    })

    // Reset form after successful submission
    responseForm.value.text = ''
    responseForm.value.geopunkt = null
    responseForm.value.file = null
  }
  catch (error) {
    console.error('Failed to submit response:', error)
  }
  finally {
    submitting.value = false
  }
}

// Check permissions for current task
const checkPermissions = async (taskId) => {
  const { token } = useEntuAuth()

  if (!token.value) {
    hasResponsePermission.value = false
    return
  }

  try {
    checkingPermissions.value = true

    const permissionData = await $fetch(`/api/tasks/${taskId}/permissions`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    hasResponsePermission.value = permissionData.success && permissionData.hasPermission
  }
  catch {
    hasResponsePermission.value = false
  }
  finally {
    checkingPermissions.value = false
  }
}

// Load existing response when task changes
watch(selectedTask, async (newTask) => {
  if (newTask) {
    const taskId = newTask._id || newTask.id
    if (!taskId) {
      return
    }

    const { token } = useEntuAuth()

    // Check permissions first
    await checkPermissions(taskId)

    // Load task response stats
    try {
      taskResponseStats.value = await getTaskResponseStats(newTask)
    }
    catch (error) {
      console.warn('Failed to load task response stats:', error)
      taskResponseStats.value = null
    }

    // Load task locations
    await loadTaskLocations()

    if (token.value) {
      try {
        // Try to fetch existing response
        const responseData = await $fetch(`/api/responses/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        })

        if (responseData.success && responseData.response) {
          // Fill form with existing response data
          const existingResponse = responseData.response
          responseForm.value = {
            text: existingResponse.kirjeldus?.[0]?.string || '',
            geopunkt: existingResponse.geopunkt?.[0]?.string || null,
            file: null // Files need special handling
          }
        }
        else {
          // No existing response, clear form
          responseForm.value = {
            text: '',
            geopunkt: null,
            file: null
          }

          // Auto-geolocate if task needs location and no existing location
          if (needsLocation.value && !responseForm.value.geopunkt) {
            try {
              await getCurrentLocation()
            }
            catch (error) {
              console.log('Auto-geolocation failed:', error)
              // Continue without location - user can set manually
            }
          }
        }
      }
      catch (error) {
        console.log('No existing response found or error loading:', error)
        // Clear form if no response found
        responseForm.value = {
          text: '',
          geopunkt: null,
          file: null
        }

        // Auto-geolocate if task needs location
        if (needsLocation.value) {
          try {
            await getCurrentLocation()
          }
          catch {
            // Continue without location - user can set manually
          }
        }
      }
    }
    else {
      // Not authenticated, clear form
      responseForm.value = {
        text: '',
        geopunkt: null,
        file: null
      }
    }
  }
  else {
    // No task selected, reset permission state and clear locations
    hasResponsePermission.value = false
    checkingPermissions.value = false
    taskLocations.value = []
    selectedLocation.value = null
  }
}, { immediate: true })

// Watch for GPS position changes and refresh locations
watch(userPosition, (newPosition, oldPosition) => {
  if (newPosition && newPosition.lat !== undefined && newPosition.lng !== undefined && taskLocations.value.length > 0) {
    // Check if position actually changed to avoid unnecessary updates
    const positionChanged = !oldPosition
      || !oldPosition.lat
      || !oldPosition.lng
      || oldPosition.lat !== newPosition.lat
      || oldPosition.lng !== newPosition.lng

    if (positionChanged) {
      // Re-sort existing locations with updated distances
      taskLocations.value = sortByDistance(taskLocations.value, newPosition)
    }
  }
}, { deep: true })
</script>
