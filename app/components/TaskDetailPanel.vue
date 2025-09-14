# TaskDetailPanel.vue - Main task detail component
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

          <!-- Location Manager -->
          <TaskLocationManager
            v-if="needsLocation"
            :has-map-data="hasMapData"
            @location-change="handleLocationOverride"
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
            @request-location="handleLocationRequest"
            @load-task-locations="loadTaskLocations"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { selectedTask, clearSelection } = useTaskWorkspace()
const {
  userPosition,
  sortByDistance,
  getLocationCoordinates
} = useLocation()

// Use task detail composable
const {
  getTaskTitle,
  getTaskDescription,
  getResponseCount,
  checkTaskPermissions,
  loadTaskLocations: loadLocations,
  initializeTask
} = useTaskDetail()

// Use geolocation composable
const {
  geolocationError,
  showManualCoordinates,
  getCurrentLocation,
  onRequestLocation,
  handleLocationChange,
  watchPosition
} = useTaskGeolocation()

// Response stats state
const taskResponseStats = ref(null)

// Response form reference
const responseFormRef = ref(null)

// Form permissions state
const checkingPermissions = ref(false)
const hasResponsePermission = ref(false)

// Task locations state
const taskLocations = ref([])
const loadingTaskLocations = ref(false)
const selectedLocation = ref(null)

// Load locations for current task
const loadTaskLocations = async () => {
  if (!selectedTask.value) {
    taskLocations.value = []
    return
  }

  try {
    loadingTaskLocations.value = true
    taskLocations.value = await loadLocations(selectedTask.value, userPosition.value)
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
const handleLocationRequest = async () => {
  await onRequestLocation(taskLocations)
}

// Handle location change from override
const handleLocationOverride = (coordinates) => {
  handleLocationChange(coordinates, taskLocations)
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
  try {
    checkingPermissions.value = true
    const result = await checkTaskPermissions(taskId)
    hasResponsePermission.value = result.hasPermission
  }
  catch (error) {
    console.error('Permission check failed:', error)
    hasResponsePermission.value = false
  }
  finally {
    checkingPermissions.value = false
  }
}

// Load existing response when task changes
watch(selectedTask, async (newTask) => {
  // Use the task initialization function
  await initializeTask(newTask, {
    responseFormRef,
    getCurrentLocation,
    needsLocation,
    checkPermissions,
    loadTaskLocations,
    setStats: (stats) => { taskResponseStats.value = stats },
    resetState: () => {
      hasResponsePermission.value = false
      checkingPermissions.value = false
      taskLocations.value = []
      selectedLocation.value = null
    }
  })
}, { immediate: true })

// Set up position watching for location sorting
// This automatically re-sorts locations when user position changes
watchPosition(userPosition, taskLocations, sortByDistance)
</script>
