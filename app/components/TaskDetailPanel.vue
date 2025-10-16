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

      <!-- Fixed map section (1/3 of available height) -->
      <div
        v-if="hasMapData"
        class="shrink-0"
        style="height: 40vh"
      >
        <TaskMapCard
          :task-locations="taskLocations as any"
          :user-position="userPosition"
          :loading-locations="loadingTaskLocations"
          :selected-location="selectedLocation as any"
          :visited-locations="visitedLocations"
          :progress="progress"
          :deadline="taskDeadline"
          :description="taskDescription"
          @location-click="onMapLocationClick"
          @map-ready="onMapReady"
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
          :task-locations="taskLocations as any"
          :selected-location="selectedLocation as any"
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

    <!-- Submission Modal -->
    <TaskSubmissionModal
      :is-open="showSubmissionModal"
      :status="submissionStatus"
      :error-message="submissionError"
      @retry="handleRetry"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { getLocationIdentifier } from '~/utils/location-sync'
import { getTaskName } from '../../utils/entu-helpers'
import { formatDate } from '../../utils/date-format'

const { selectedTask, clearSelection } = useTaskWorkspace()
const { locale } = useI18n()
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
  onRequestLocation
} = useTaskGeolocation()

// Use optimistic update composable
const { refetchTask } = useOptimisticTaskUpdate(selectedTask)

// Submission modal state
const showSubmissionModal = ref(false)
const submissionStatus = ref<'submitting' | 'success' | 'error'>('submitting')
const submissionError = ref<string | undefined>(undefined)

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

// Task deadline for map card
const taskDeadline = computed(() => {
  if (!selectedTask.value) return null
  // Get deadline from task (tahtaeg property)
  const deadline = selectedTask.value.tahtaeg?.[0]?.datetime
  if (!deadline) return null
  // Use date formatting utility with app locale
  return formatDate(deadline, locale.value)
})

// Task description for map card
const taskDescription = computed(() => {
  if (!selectedTask.value) return null
  return selectedTask.value.kirjeldus?.[0]?.string || null
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
// Constitutional: Uses index signature for flexible Entu location entity properties
// Location entities may have additional custom fields from Entu schema.
// Principle I: Type Safety First - documented exception for external API flexibility
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
// Constitutional: Location data from map click events has flexible structure
// We validate and extract needed properties at this boundary
// Principle I: Type Safety First - documented exception for map event data
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
    const locations = await loadLocations(selectedTask.value, userPosition.value)
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

// Handle response submission with optimistic updates
const handleResponseSubmitted = async (_responseData: unknown): Promise<void> => {
  // Show submitting modal
  showSubmissionModal.value = true
  submissionStatus.value = 'submitting'
  submissionError.value = undefined

  try {
    // Reset the form
    const form = responseFormRef.value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (form && typeof (form as any).resetForm === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (form as any).resetForm()
    }

    // Clear selected location
    selectedLocation.value = null

    // Refetch task data to get updated response count
    // This reloads completed tasks and recalculates unique locations visited
    if (selectedTask.value?._id) {
      await refetchTask(selectedTask.value._id)
    }

    // Show success state
    submissionStatus.value = 'success'

    // Auto-close modal after success
    setTimeout(() => {
      showSubmissionModal.value = false
    }, 1500)
  }
  catch (error) {
    // Show error state
    submissionStatus.value = 'error'
    submissionError.value = error instanceof Error ? error.message : 'Unknown error occurred'
  }
}

// Handle retry after submission error
const handleRetry = () => {
  showSubmissionModal.value = false
  submissionError.value = undefined
}

// Handle modal close
const handleModalClose = () => {
  showSubmissionModal.value = false
  submissionError.value = undefined
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
