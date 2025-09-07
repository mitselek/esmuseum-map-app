<template>
  <div class="mb-4">
    <label
      :for="inputId"
      class="mb-2 block text-sm font-medium text-gray-700"
    >
      {{ $t('taskDetail.addFile') }}
    </label>
    <input
      :id="inputId"
      ref="fileInput"
      type="file"
      class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      :accept="acceptedTypes"
      :disabled="disabled"
      @change="handleFileSelect"
    >
    <p class="mt-1 text-xs text-gray-500">
      {{ $t('taskDetail.allowedFiles') }}
    </p>

    <!-- Selected File Display -->
    <div
      v-if="selectedFile"
      class="mt-2 rounded bg-blue-50 p-2"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm text-blue-900">
          📎 {{ selectedFile.name }}
        </span>
        <button
          type="button"
          class="text-sm text-blue-600 hover:text-blue-800"
          @click="clearFile"
        >
          {{ $t('taskDetail.remove') }}
        </button>
      </div>
      <div class="text-xs text-blue-700">
        {{ formatFileSize(selectedFile.size) }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: File,
    default: null
  },
  acceptedTypes: {
    type: String,
    default: 'image/*,.pdf,.doc,.docx'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  inputId: {
    type: String,
    default: 'file-upload'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const selectedFile = ref(props.modelValue)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newFile) => {
  selectedFile.value = newFile
})

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  selectedFile.value = file
  emit('update:modelValue', file)
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('update:modelValue', null)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
