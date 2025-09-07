<template>
  <div class="flex-1 overflow-y-auto">
    <!-- No Task Selected State -->
    <LoadingStates
      v-if="!selectedTask"
      :show-empty="true"
      empty-icon="📋"
      :empty-title="$t('taskDetail.noTaskSelected')"
      :empty-message="$t('taskDetail.selectTaskFromSidebar')"
    />

    <!-- Task Content -->
    <div
      v-else
      class="p-6"
    >
      <!-- Task Information Card -->
      <TaskInfoCard
        :title="getTaskTitle(selectedTask)"
        :description="getTaskDescription(selectedTask)"
        :group="getTaskGroup(selectedTask)"
        :response-count="getResponseCount(selectedTask)"
        :has-user-response="!!userResponse"
      />

      <!-- Map Card (if task has location data) -->
      <div
        v-if="hasMapData"
        class="mb-4 rounded-lg border bg-white p-4 shadow-sm"
      >
        <h3 class="mb-3 text-lg font-medium text-gray-900">
          {{ $t('taskDetail.map') }}
        </h3>
        <div class="rounded-lg bg-gray-100 p-8 text-center">
          <div class="text-gray-500">
            🗺️
          </div>
          <p class="mt-2 text-sm text-gray-600">
            {{ $t('taskDetail.mapIntegrationComing') }}
          </p>
        </div>
      </div>

      <!-- Response Form -->
      <TaskResponseForm
        :task="selectedTask"
        :user-response="userResponse"
        :submitting="submitting"
        @submit="handleFormSubmit"
        @location-request="handleLocationRequest"
      >
        <template #location-picker="{ onManual, onRequestLocation }">
          <!-- Placeholder for location picker - integrate with actual LocationPicker component -->
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div class="text-center text-sm text-gray-600">
              📍 {{ $t('taskDetail.locationPickerPlaceholder') }}
            </div>
            <div class="mt-2 flex justify-center space-x-2">
              <button
                type="button"
                class="text-sm text-blue-600 hover:text-blue-800"
                @click="onRequestLocation"
              >
                {{ $t('taskDetail.useCurrentLocation') }}
              </button>
              <button
                type="button"
                class="text-sm text-green-600 hover:text-green-800"
                @click="onManual"
              >
                {{ $t('taskDetail.enterManually') }}
              </button>
            </div>
          </div>
        </template>
      </TaskResponseForm>
    </div>
  </div>
</template>

<script setup>
const { selectedTask } = useTaskWorkspace()
const { $t } = useI18n()

// Local state for form handling
const submitting = ref(false)
const userResponse = ref(null)

// Computed properties
const hasMapData = computed(() => {
  return selectedTask.value?.properties?.kaart || selectedTask.value?.properties?.coordinates
})

// Methods
const handleFormSubmit = async (formData) => {
  try {
    submitting.value = true

    // TODO: Implement actual form submission API call
    console.log('Submitting form data:', formData)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show success message
    alert($t('taskDetail.responseSubmittedSuccessfully'))

    // Reload user response
    await loadUserResponse()
  }
  catch (err) {
    console.error('Error submitting response:', err)
    alert($t('taskDetail.errorSubmittingResponse', { error: err.message }))
  }
  finally {
    submitting.value = false
  }
}

const handleLocationRequest = async () => {
  try {
    // TODO: Implement location request handling
    console.log('Location request triggered')
  }
  catch (err) {
    console.error('Error requesting location:', err)
  }
}

const loadUserResponse = async () => {
  // TODO: Implement loading user's existing response
  userResponse.value = null
}

// Helper methods for task data extraction
const getTaskTitle = (task) => {
  return task?.name?.[0]?.string || $t('taskDetail.noTitle')
}

const getTaskDescription = (task) => {
  return task?.description?.[0]?.string || null
}

const getTaskGroup = (task) => {
  return task?.grupp?.[0]?.string || null
}

const getResponseCount = (task) => {
  return task?.vastuseid?.[0]?.number || 0
}

// Load user response when task changes
watch(selectedTask, async (newTask) => {
  if (newTask) {
    await loadUserResponse()
  }
}, { immediate: true })
</script>
