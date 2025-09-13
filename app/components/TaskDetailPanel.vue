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
          <TaskLocationManager
            :has-map-data="hasMapData"
            @location-change="handleLocationChange"
          />

          <!-- Response Form -->
          <TaskResponseForm
            ref="responseFormRef"
            :selected-task="selectedTask"
            :checking-permissions="checkingPermissions"
            :has-response-permission="hasResponsePermission"
            :needs-location="needsLocation"
            :task-locations="taskLocations"
            :user-position="userPosition"
            :selected-location="selectedLocation"
            :loading-task-locations="loadingTaskLocations"
            :geolocation-error="geolocationError"
            @location-select="onLocationSelect"
            @request-location="onRequestLocation"
            @load-task-locations="loadTaskLocations"
          />
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

// Response form reference
const responseFormRef = ref(null)

// Form permissions state
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
        if (responseFormRef.value) {
          responseFormRef.value.setLocation(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`)
        }

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
    if (responseFormRef.value) {
      responseFormRef.value.setLocation(getLocationCoordinates(location))
    }
    showManualCoordinates.value = false
  }
  else {
    if (responseFormRef.value) {
      responseFormRef.value.setLocation(null)
    }
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

// Location Override Management
const handleLocationChange = (coordinates) => {
  if (coordinates) {
    // Apply manual coordinates
    const parts = coordinates.split(',').map((s) => s.trim())
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])

    if (!isNaN(lat) && !isNaN(lng)) {
      userPosition.value = { lat, lng, accuracy: null, manual: true }
      hasManualOverride.value = true
      manualCoordinates.value = coordinates

      // Re-sort locations with new position
      if (taskLocations.value.length > 0) {
        taskLocations.value = sortByDistance(taskLocations.value, userPosition.value)
      }
    }
  }
  else {
    // Clear manual override
    hasManualOverride.value = false
    manualCoordinates.value = ''

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
          // Existing response found - form component will handle its state
          console.log('Found existing response:', responseData.response)
        }
        else {
          // No existing response - form starts empty
          // Auto-geolocate if task needs location
          if (needsLocation.value) {
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
      // Not authenticated, clear form (form component handles its own state)
      console.log('Not authenticated')
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
