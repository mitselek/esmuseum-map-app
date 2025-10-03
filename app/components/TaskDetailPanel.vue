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
      <TaskWorkspaceHeader
        :progress="progress"
        :task-title="taskTitle"
        @close="clearSelection"
      />

      <!-- Fixed map section (30vh) -->
      <div
        v-if="hasMapData"
        class="shrink-0"
        style="height: 30vh"
      >
        <TaskMapCard
          :task-locations="taskLocations"
          :user-position="userPosition"
          :loading-locations="loadingTaskLocations"
          :selected-location="selectedLocation"
          :visited-locations="visitedLocations"
          @location-click="onMapLocationClick"
          @map-ready="onMapReady"
          @location-change="handleLocationOverride"
        />
      </div>

      <!-- Scrollable content area -->
      <div class="flex-1 overflow-y-auto">
        <!-- Response Form -->
        <TaskResponseForm
          ref="responseFormRef"
          :selected-task="selectedTask"
          :checking-permissions="checkingPermissions"
          :has-response-permission="hasResponsePermission"
          :needs-location="needsLocation"
          :task-locations="taskLocations"
          :selected-location="selectedLocation"
          :loading-task-locations="loadingTaskLocations"
          :geolocation-error="geolocationError"
          :visited-locations="visitedLocations"
          @location-select="onLocationSelect"
          @request-location="handleLocationRequest"
          @load-task-locations="loadTaskLocations"
          @response-submitted="handleResponseSubmitted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getLocationIdentifier } from '~/utils/location-sync'
import { getTaskName } from '../../utils/entu-helpers'

const { selectedTask, clearSelection } = useTaskWorkspace()
const {
  getLocationCoordinates,
  userPosition
} = useLocation()

// Use task detail composable
const {
  checkTaskPermissions,
  loadTaskLocations: loadLocations,
  initializeTask
} = useTaskDetail()

// Use geolocation composable
const {
  geolocationError,
  showManualCoordinates,
  onRequestLocation,
  handleLocationChange
} = useTaskGeolocation()

// Use completed tasks tracking
const {
  loadCompletedTasks
} = useCompletedTasks()

// Task scoring (now uses consolidated cache from useCompletedTasks, no extra API calls)
const scoringData = useTaskScoring(computed(() => selectedTask.value))
const visitedLocations = computed(() => scoringData.visitedLocations.value)

interface ProgressData {
  actual: number
  expected: number
}

const progress = computed<ProgressData>(() => {
  const expected = scoringData.totalExpected.value
  const actual = scoringData.uniqueLocationsCount.value

  if (expected > 0) {
    return { actual, expected }
  }

  const fallbackExpected
    = selectedTask.value?.vastuseid?.[0]?.number
      || selectedTask.value?.responseStats?.expected
      || actual

  return {
    actual,
    expected: fallbackExpected || 0
  }
})

// Task title for header
const taskTitle = computed(() => {
  return selectedTask.value ? getTaskName(selectedTask.value) : ''
})

interface ResponseFormRef {
  setLocation: (coordinates: { lat: number, lng: number } | string | null) => void
}

// Response form reference
const responseFormRef = ref<ResponseFormRef | null>(null)

// Form permissions state
const checkingPermissions = ref<boolean>(false)
const hasResponsePermission = ref<boolean>(false)

// Task locations state
interface TaskLocation {
  _id: string
  reference?: string
  name?: Array<{ string: string }>
  lat?: Array<{ number: number }>
  long?: Array<{ number: number }>
  [key: string]: unknown
}

const taskLocations = ref<TaskLocation[]>([])
const loadingTaskLocations = ref<boolean>(false)
const selectedLocation = ref<TaskLocation | null>(null)

// Map event handlers
const onMapLocationClick = (location: TaskLocation): void => {
  // Handle location click from map
  console.log('[TaskDetailPanel] Map location clicked:', getLocationIdentifier(location))
  console.log('[TaskDetailPanel] Setting selectedLocation to:', location)
  selectedLocation.value = location
  if (responseFormRef.value) {
    responseFormRef.value.setLocation(getLocationCoordinates(location))
  }
}

const onMapReady = () => {
  // Map is ready for interactions
}

// Load locations for current task (optimized for parallel execution)
const loadTaskLocations = async () => {
  if (!selectedTask.value) {
    taskLocations.value = []
    return
  }

  try {
    loadingTaskLocations.value = true

    // OPTIMIZATION: Start location loading immediately without waiting for GPS
    // This allows locations to be displayed while GPS detection happens in parallel
    const locations = await loadLocations(selectedTask.value)
    taskLocations.value = locations

    // Note: GPS-based sorting will happen automatically in LocationPicker
    // when GPS position becomes available, providing progressive enhancement
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
const onLocationSelect = (location: TaskLocation | null): void => {
  console.log('[TaskDetailPanel] List location selected:', location ? getLocationIdentifier(location) : 'null')
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
const handleLocationOverride = (coordinates: string | null): void => {
  handleLocationChange(coordinates, taskLocations)
}

// Handle response submission for page reload
const handleResponseSubmitted = (_responseData: unknown): void => {
  // Reload the page to ensure fresh data
  setTimeout(() => {
    window.location.reload()
  }, 500) // Small delay to let the submission complete
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
const checkPermissions = async (taskId: string): Promise<void> => {
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
  // 🔍 EVENT TRACKING: Task selection change
  const startTime = performance.now()
  console.log('🎯 [EVENT] TaskDetailPanel - Task selection changed', {
    timestamp: new Date().toISOString(),
    taskId: newTask?._id || 'null',
    taskName: newTask?.name || 'null'
  })

  // Use the task initialization function
  await initializeTask(newTask, {
    responseFormRef,
    needsLocation,
    checkPermissions,
    loadTaskLocations,
    resetState: () => {
      hasResponsePermission.value = false
      checkingPermissions.value = false
      taskLocations.value = []
      selectedLocation.value = null
    }
  })

  // Load completed tasks for filtering
  if (newTask) {
    await loadCompletedTasks()
  }

  // 🔍 EVENT TRACKING: Task initialization complete
  console.log('🎯 [EVENT] TaskDetailPanel - Task initialization completed', {
    timestamp: new Date().toISOString(),
    duration: `${(performance.now() - startTime).toFixed(2)}ms`
  })
}, { immediate: true })

// Note: Location sorting is now handled automatically in LocationPicker component
// via the centralized GPS service, so no need for manual position watching here
</script>
