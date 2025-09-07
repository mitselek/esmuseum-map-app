<template>
  <div class="rounded-lg border bg-white p-4 shadow-sm">
    <h3 class="mb-4 text-lg font-medium text-gray-900">
      {{ hasUserResponse ? $t('taskDetail.yourResponse') : $t('taskDetail.submitResponse') }}
    </h3>

    <form @submit.prevent="handleSubmit">
      <!-- File Upload -->
      <FileUpload
        v-model="formData.file"
        :disabled="submitting"
        input-id="response-file"
      />

      <!-- Location Selection -->
      <div class="mb-6">
        <label class="mb-2 block text-sm font-medium text-gray-700">
          {{ $t('taskDetail.location') }}
        </label>

        <!-- Location Picker Component -->
        <slot
          name="location-picker"
          :selected="selectedLocation"
          :on-select="onLocationSelect"
          :on-manual="() => showManualCoordinates = true"
          :on-request-location="onRequestLocation"
        />

        <!-- Manual Coordinate Entry (fallback) -->
        <ManualCoordinatesInput
          v-model="manualCoordinates"
          :show="showManualCoordinates"
          :disabled="submitting"
          :getting-location="gettingLocation"
          @close="showManualCoordinates = false"
          @get-current-location="getCurrentLocation"
          @use-coordinates="useManualCoordinates"
        />

        <!-- Current Selection Display -->
        <div
          v-if="formData.geopunkt && !showManualCoordinates"
          class="mt-2 rounded-lg bg-green-50 p-3"
        >
          <p class="text-sm text-green-800">
            {{ $t('taskDetail.locationSet', { coordinates: formatDisplayCoordinates(formData.geopunkt) }) }}
          </p>
        </div>
      </div>

      <!-- Text Response -->
      <ResponseTextarea
        v-model="formData.text"
        :disabled="submitting"
        input-id="response-text"
      />

      <!-- Submit Button -->
      <div class="flex flex-col space-y-2">
        <button
          type="submit"
          class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canSubmit || submitting"
        >
          {{ submitting ? $t('taskDetail.submitting') : (hasUserResponse ? $t('taskDetail.updateResponse') : $t('taskDetail.submitResponseBtn')) }}
        </button>

        <div
          v-if="hasUserResponse"
          class="text-center"
        >
          <p class="text-xs text-gray-500">
            {{ $t('taskDetail.canUpdateUntilDeadline') }}
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
// Import child components
import FileUpload from '~/components/task/FileUpload.vue'
import ResponseTextarea from '~/components/task/ResponseTextarea.vue'
import ManualCoordinatesInput from '~/components/task/ManualCoordinatesInput.vue'

const { t } = useI18n()

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  userResponse: {
    type: Object,
    default: null
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'location-request'])

// Local state
const formData = ref({
  text: '',
  file: null,
  geopunkt: ''
})

const selectedLocation = ref(null)
const showManualCoordinates = ref(false)
const manualCoordinates = ref('')
const gettingLocation = ref(false)

// Computed properties
const hasUserResponse = computed(() => !!props.userResponse)

const canSubmit = computed(() => {
  return formData.value.text.trim().length > 0 || formData.value.file
})

// Initialize form data from user response if exists
watch(() => props.userResponse, (response) => {
  if (response) {
    formData.value.text = getUserResponseText(response)
    formData.value.geopunkt = getUserResponseLocation(response)
  }
}, { immediate: true })

// Methods
const handleSubmit = () => {
  emit('submit', {
    text: formData.value.text,
    file: formData.value.file,
    geopunkt: formData.value.geopunkt
  })
}

const onLocationSelect = (location) => {
  selectedLocation.value = location
  if (location) {
    // Use location coordinates - this should be passed from parent or composable
    formData.value.geopunkt = getLocationCoordinates(location)
    showManualCoordinates.value = false
  }
  else {
    formData.value.geopunkt = ''
  }
}

const onRequestLocation = async () => {
  emit('location-request')
}

const getCurrentLocation = async () => {
  try {
    gettingLocation.value = true

    // This functionality should be provided by parent component or composable
    const position = await getUserPosition()
    const coordinates = `${position.lat},${position.lng}`

    if (showManualCoordinates.value) {
      manualCoordinates.value = coordinates
    }
    else {
      formData.value.geopunkt = coordinates
      selectedLocation.value = null
    }
  }
  catch (err) {
    console.error('Geolocation error:', err)
    alert(t('taskDetail.geolocationError', { error: err.message }))
  }
  finally {
    gettingLocation.value = false
  }
}

const useManualCoordinates = () => {
  if (manualCoordinates.value) {
    formData.value.geopunkt = manualCoordinates.value
    selectedLocation.value = null
    showManualCoordinates.value = false
  }
}

// Helper functions - these should ideally come from composables
const formatDisplayCoordinates = (geopunkt) => {
  return geopunkt // Simplified - should use proper formatting
}

const getUserResponseText = (response) => {
  return response?.properties?.text?.[0]?.value || ''
}

const getUserResponseLocation = (response) => {
  return response?.properties?.geopunkt?.[0]?.value || ''
}

// These functions should be provided by parent or composable
const getLocationCoordinates = (location) => {
  // Placeholder - should be implemented by parent
  return location?.coordinates || ''
}

const getUserPosition = () => {
  // Placeholder - should be provided by location composable
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}

// Expose form data for parent component
defineExpose({
  formData,
  resetForm: () => {
    formData.value = {
      text: '',
      file: null,
      geopunkt: ''
    }
    selectedLocation.value = null
    showManualCoordinates.value = false
    manualCoordinates.value = ''
  }
})
</script>
