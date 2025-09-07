<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="border-b bg-white shadow-sm">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">
            🧪 Modular Components Test
          </h1>
          <div class="flex space-x-4">
            <NuxtLink
              to="/test-f007"
              class="text-blue-600 hover:text-blue-800"
            >
              ← F007 SPA Test
            </NuxtLink>
            <NuxtLink
              to="/"
              class="text-blue-600 hover:text-blue-800"
            >
              Home
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <div class="p-6">
      <!-- Component Selection -->
      <div class="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <h2 class="mb-4 text-lg font-medium text-gray-900">
          Select Component to Test
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="comp in components"
            :key="comp.id"
            class="rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
            :class="{ 'bg-blue-600 text-white': activeComponent === comp.id }"
            @click="activeComponent = comp.id"
          >
            {{ comp.name }}
          </button>
        </div>
      </div>

      <!-- Component Demo Area -->
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-lg font-medium text-gray-900">
          {{ currentComponent?.name || 'Select a component' }}
        </h3>
        <p
          v-if="currentComponent?.description"
          class="mb-6 text-sm text-gray-600"
        >
          {{ currentComponent.description }}
        </p>

        <!-- TaskInfoCard Demo -->
        <div v-if="activeComponent === 'info'">
          <TaskInfoCard
            title="Sample Task: Museum Artifact Documentation"
            description="Document historical artifacts found in the museum storage. This task requires careful cataloging and photography of each item."
            group="History Department"
            :response-count="12"
            :has-user-response="hasResponse"
          />
          <div class="mt-4">
            <button
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="hasResponse = !hasResponse"
            >
              Toggle Response Status
            </button>
          </div>
        </div>

        <!-- FileUpload Demo -->
        <div v-if="activeComponent === 'file'">
          <FileUpload
            v-model="testFile"
            :disabled="fileDisabled"
            input-id="test-file-upload"
          />
          <div class="mt-4 space-x-2">
            <button
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="fileDisabled = !fileDisabled"
            >
              {{ fileDisabled ? 'Enable' : 'Disable' }}
            </button>
            <button
              class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              @click="testFile = null"
            >
              Clear File
            </button>
          </div>
          <div
            v-if="testFile"
            class="mt-4 rounded bg-green-50 p-3"
          >
            <p class="text-sm text-green-800">
              Selected: {{ testFile.name }} ({{ formatFileSize(testFile.size) }})
            </p>
          </div>
        </div>

        <!-- ResponseTextarea Demo -->
        <div v-if="activeComponent === 'textarea'">
          <ResponseTextarea
            v-model="testText"
            :disabled="textDisabled"
            :show-char-count="true"
            :max-length="500"
            input-id="test-textarea"
          />
          <div class="mt-4 space-x-2">
            <button
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="textDisabled = !textDisabled"
            >
              {{ textDisabled ? 'Enable' : 'Disable' }}
            </button>
            <button
              class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              @click="testText = ''"
            >
              Clear Text
            </button>
            <button
              class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              @click="testText = 'This is a sample response to demonstrate the textarea component functionality.'"
            >
              Sample Text
            </button>
          </div>
          <div
            v-if="testText"
            class="mt-4 rounded bg-blue-50 p-3"
          >
            <p class="text-sm text-blue-800">
              Current text: "{{ testText }}" ({{ testText.length }} characters)
            </p>
          </div>
        </div>

        <!-- ManualCoordinatesInput Demo -->
        <div v-if="activeComponent === 'coordinates'">
          <ManualCoordinatesInput
            v-model="testCoordinates"
            :show="showCoordInput"
            :disabled="coordDisabled"
            :getting-location="gettingLocation"
            @close="showCoordInput = false"
            @get-current-location="handleGetLocation"
            @use-coordinates="handleUseCoordinates"
          />
          <div class="mt-4 space-x-2">
            <button
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="showCoordInput = !showCoordInput"
            >
              {{ showCoordInput ? 'Hide' : 'Show' }} Input
            </button>
            <button
              class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              @click="testCoordinates = '59.4370, 24.7536'"
            >
              Set Tallinn Coordinates
            </button>
          </div>
          <div
            v-if="finalCoordinates"
            class="mt-4 rounded bg-green-50 p-3"
          >
            <p class="text-sm text-green-800">
              Final coordinates: {{ finalCoordinates }}
            </p>
          </div>
        </div>

        <!-- LoadingStates Demo -->
        <div v-if="activeComponent === 'loading'">
          <div class="space-y-4">
            <div>
              <h4 class="mb-2 font-medium">
                Loading State:
              </h4>
              <LoadingStates
                :loading="true"
                loading-text="Loading your tasks..."
              />
            </div>

            <div>
              <h4 class="mb-2 font-medium">
                Error State:
              </h4>
              <LoadingStates
                :loading="false"
                error="Failed to connect to the server. Please check your internet connection."
                error-title="Connection Error"
                @retry="handleRetry"
              />
            </div>

            <div>
              <h4 class="mb-2 font-medium">
                Empty State:
              </h4>
              <LoadingStates
                :loading="false"
                :show-empty="true"
                empty-icon="📝"
                empty-title="No Tasks Found"
                empty-message="You don't have any tasks assigned yet. Check back later or contact your supervisor."
                :show-empty-action="true"
                empty-action-text="Refresh Tasks"
                @empty-action="handleEmptyAction"
              />
            </div>
          </div>
        </div>

        <!-- TaskResponseForm Demo -->
        <div v-if="activeComponent === 'form'">
          <TaskResponseForm
            :task="sampleTask"
            :user-response="sampleUserResponse"
            :submitting="formSubmitting"
            @submit="handleFormSubmit"
            @location-request="handleLocationRequest"
          >
            <template #location-picker="{ onManual, onRequestLocation }">
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div class="text-center text-sm text-gray-600">
                  📍 Location Picker Component (Demo)
                </div>
                <div class="mt-2 flex justify-center space-x-2">
                  <button
                    type="button"
                    class="text-sm text-blue-600 hover:text-blue-800"
                    @click="onRequestLocation"
                  >
                    Use Current Location
                  </button>
                  <button
                    type="button"
                    class="text-sm text-green-600 hover:text-green-800"
                    @click="onManual"
                  >
                    Enter Manually
                  </button>
                </div>
              </div>
            </template>
          </TaskResponseForm>

          <div class="mt-4 space-x-2">
            <button
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="sampleUserResponse = sampleUserResponse ? null : { id: 1, properties: { text: [{ value: 'Existing response text' }] } }"
            >
              {{ sampleUserResponse ? 'Remove' : 'Add' }} Existing Response
            </button>
          </div>
        </div>

        <!-- Default state -->
        <div
          v-if="!activeComponent"
          class="py-8 text-center text-gray-500"
        >
          👆 Select a component above to see it in action
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Explicit imports for components that aren't auto-importing
import TaskInfoCard from '~/components/task/TaskInfoCard.vue'
import FileUpload from '~/components/task/FileUpload.vue'
import ResponseTextarea from '~/components/task/ResponseTextarea.vue'
import ManualCoordinatesInput from '~/components/task/ManualCoordinatesInput.vue'
import LoadingStates from '~/components/task/LoadingStates.vue'
import TaskResponseForm from '~/components/task/TaskResponseForm.vue'

definePageMeta({
  middleware: 'auth'
})

const { $t: _$t } = useI18n()

// Component selection
const activeComponent = ref(null)

const components = [
  { id: 'info', name: 'TaskInfoCard', description: 'Displays task metadata and information' },
  { id: 'file', name: 'FileUpload', description: 'File upload with preview and validation' },
  { id: 'textarea', name: 'ResponseTextarea', description: 'Text response input with character counting' },
  { id: 'coordinates', name: 'ManualCoordinatesInput', description: 'Manual coordinate entry with GPS integration' },
  { id: 'loading', name: 'LoadingStates', description: 'Loading, error, and empty state components' },
  { id: 'form', name: 'TaskResponseForm', description: 'Complete task response form with all inputs' }
]

const currentComponent = computed(() => {
  return components.find((comp) => comp.id === activeComponent.value)
})

// Demo state
const hasResponse = ref(false)
const testFile = ref(null)
const fileDisabled = ref(false)
const testText = ref('')
const textDisabled = ref(false)
const testCoordinates = ref('')
const showCoordInput = ref(false)
const coordDisabled = ref(false)
const gettingLocation = ref(false)
const finalCoordinates = ref('')
const formSubmitting = ref(false)
const sampleUserResponse = ref(null)

// Sample data
const sampleTask = {
  name: [{ string: 'Sample Museum Task' }],
  description: [{ string: 'This is a sample task for testing the form component.' }],
  grupp: [{ string: 'Test Group' }],
  vastuseid: [{ number: 5 }]
}

// Methods
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleGetLocation = async () => {
  gettingLocation.value = true
  try {
    // Simulate getting location
    await new Promise((resolve) => setTimeout(resolve, 2000))
    testCoordinates.value = '59.4370, 24.7536'
  }
  finally {
    gettingLocation.value = false
  }
}

const handleUseCoordinates = () => {
  finalCoordinates.value = testCoordinates.value
  showCoordInput.value = false
}

const handleRetry = () => {
  alert('Retry clicked!')
}

const handleEmptyAction = () => {
  alert('Empty action clicked!')
}

const handleFormSubmit = async (formData) => {
  formSubmitting.value = true
  try {
    console.log('Form submitted:', formData)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert('Form submitted successfully!')
  }
  finally {
    formSubmitting.value = false
  }
}

const handleLocationRequest = () => {
  console.log('Location request triggered')
  alert('Location request triggered!')
}
</script>
