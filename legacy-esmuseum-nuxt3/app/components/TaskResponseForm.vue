<template>
  <div class="rounded-lg border bg-white p-6 shadow-sm">
    <h3 class="mb-4 text-lg font-medium text-gray-900">
      {{ $t('taskDetail.yourResponse') }}
    </h3>

    <!-- Permission checking state -->
    <TaskPermissionLoading v-if="checkingPermissions" />

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
          :selected="selectedLocation"
          :loading="loadingTaskLocations"
          :error="geolocationError"
          :visited-locations="visitedLocations"
          @select="onLocationSelect"
          @request-location="onRequestLocation"
          @retry="loadTaskLocations"
        />
      </div>

      <!-- Text Response -->
      <TaskResponseTextarea
        v-model:response-text="responseForm.text"
        :submitting="submitting"
      />

      <!-- File Upload -->
      <TaskFileUpload
        ref="fileUploadRef"
        @upload-complete="onFileUploadComplete"
        @upload-error="onFileUploadError"
      />

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
</template>

<script setup>
// Props
const props = defineProps({
  selectedTask: {
    type: Object,
    required: true
  },
  checkingPermissions: {
    type: Boolean,
    default: false
  },
  hasResponsePermission: {
    type: Boolean,
    default: false
  },
  needsLocation: {
    type: Boolean,
    default: false
  },
  taskLocations: {
    type: Array,
    default: () => []
  },
  selectedLocation: {
    type: Object,
    default: null
  },
  loadingTaskLocations: {
    type: Boolean,
    default: false
  },
  geolocationError: {
    type: String,
    default: null
  },
  visitedLocations: {
    type: Set,
    default: () => new Set()
  }
})

// Emits
const emit = defineEmits(['locationSelect', 'requestLocation', 'loadTaskLocations', 'response-submitted'])

// Form state
const responseForm = ref({
  text: '',
  geopunkt: null,
  file: null
})

const submitting = ref(false)
const fileUploadRef = ref(null)
const uploadedFiles = ref([])

// Computed properties
const canSubmit = computed(() => {
  return responseForm.value.text.trim().length > 0
})

// Debug: Watch selectedLocation changes
watch(() => props.selectedLocation, (newLocation, oldLocation) => {
  console.log('[TaskResponseForm] selectedLocation changed:', {
    from: oldLocation?.nimi || oldLocation?.name || 'null',
    to: newLocation?.nimi || newLocation?.name || 'null'
  })
}, { deep: true })

// Event handlers
const onLocationSelect = (location) => {
  emit('locationSelect', location)
}

const onRequestLocation = () => {
  emit('requestLocation')
}

const loadTaskLocations = () => {
  emit('loadTaskLocations')
}

// File upload handlers
const onFileUploadComplete = (results) => {
  console.log('File upload completed:', results)
  uploadedFiles.value = results.filter((result) => result.success)
}

const onFileUploadError = (error) => {
  console.error('File upload error:', error)
}

// Form submission
const submitResponse = async () => {
  if (!canSubmit.value || !props.selectedTask) return

  submitting.value = true

  try {
    // F015: Use feature-flagged response creation
    const { createTaskResponse } = useTaskResponseCreation()

    // Step 1: Create the response entity first
    const requestData = {
      taskId: props.selectedTask._id,
      responses: [
        {
          questionId: 'default', // Using default for simple text response
          type: 'text',
          value: responseForm.value.text,
          metadata: {
            // Include location reference if available
            locationId: props.selectedLocation?.reference || props.selectedLocation?._id,
            // Include coordinates if available
            coordinates: responseForm.value.geopunkt
              ? (() => {
                  const coords = responseForm.value.geopunkt.split(',')
                  return {
                    lat: parseFloat(coords[0]?.trim()),
                    lng: parseFloat(coords[1]?.trim())
                  }
                })()
              : undefined
          }
        }
      ]
    }

    // Create the response entity using feature-flagged approach
    const response = await createTaskResponse(requestData)

    console.log('Response created:', response)

    // Step 2: Upload files to the newly created response entity
    let fileReferences = []

    // Debug: Check response structure and extract correct ID
    console.log('F015: Full response structure:', JSON.stringify(response, null, 2))
    const responseId = response.data?.id || response.id || response._id || response.data?._id
    console.log('F015: Extracted response ID:', responseId)

    // Debug: Check file upload component state
    console.log('F015: Checking file upload state:', {
      hasFileUploadRef: !!fileUploadRef.value,
      filesLength: fileUploadRef.value?.files?.length || 0,
      files: fileUploadRef.value?.files || 'undefined',
      responseId: responseId
    })

    if (fileUploadRef.value && fileUploadRef.value.files.length > 0 && responseId) {
      console.log('F015: Starting file upload process...')
      try {
        const uploadResults = await fileUploadRef.value.uploadFiles(responseId)
        fileReferences = uploadResults
          .filter((result) => result.success)
          .map((result) => result.entityId)
        console.log('Files uploaded, entity IDs:', fileReferences)
      }
      catch (uploadError) {
        console.error('File upload failed:', uploadError)
        // Continue with form submission even if file upload fails
      }
    }

    // Emit response submitted event for optimistic updates
    emit('response-submitted', {
      responseData: requestData,
      apiResponse: response,
      locationReference: props.selectedLocation?.reference,
      uploadedFiles: fileReferences
    })

    // Reset form after successful submission
    responseForm.value.text = ''
    responseForm.value.geopunkt = null
    responseForm.value.file = null
    uploadedFiles.value = []

    // Clear file upload component
    if (fileUploadRef.value) {
      fileUploadRef.value.clearFiles()
    }
  }
  catch (error) {
    console.error('Failed to submit response:', error)
  }
  finally {
    submitting.value = false
  }
}

// Expose methods and data for parent component
defineExpose({
  responseForm,
  setLocation: (coordinates) => {
    responseForm.value.geopunkt = coordinates
  }
})
</script>
