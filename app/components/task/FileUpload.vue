<template>
  <div class="mb-4">
    <label
      :for="inputId"
      class="mb-2 block text-sm font-medium text-gray-700"
    >
      {{ $t('taskDetail.addFile') }}
    </label>

    <!-- Drag and Drop Area -->
    <div
      class="relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors"
      :class="{
        'border-blue-400 bg-blue-50': isDragging,
        'hover:border-gray-400': !disabled && !isDragging,
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        :id="inputId"
        ref="fileInput"
        type="file"
        class="absolute inset-0 size-full cursor-pointer opacity-0"
        :accept="acceptedTypes"
        :disabled="disabled"
        @change="handleFileSelect"
      >

      <div
        v-if="!selectedFile"
        class="space-y-2"
      >
        <div class="mx-auto size-12 text-gray-400">
          📁
        </div>
        <div class="text-sm text-gray-600">
          <span class="font-medium text-blue-600">{{ $t('taskDetail.clickToUpload') }}</span>
          {{ $t('taskDetail.orDragAndDrop') }}
        </div>
        <p class="text-xs text-gray-500">
          {{ $t('taskDetail.allowedFiles') }}
        </p>
      </div>
    </div>

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
    type: [File, Array],
    default: () => []
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
const isDragging = ref(false)

// Handle both single file and array of files
const selectedFiles = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue
  }
  return props.modelValue ? [props.modelValue] : []
})

const selectedFile = computed(() => {
  return selectedFiles.value[0] || null
})

const validateAndEmitFile = (file) => {
  if (!file) return

  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    alert(`File is too large. Maximum size is ${formatFileSize(maxSize)}`)
    return false
  }

  // Always emit as array for consistency with form persistence
  emit('update:modelValue', [file])
  return true
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!validateAndEmitFile(file)) {
    event.target.value = '' // Clear the input if validation failed
  }
}

const handleDragOver = () => {
  if (!props.disabled) {
    isDragging.value = true
  }
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event) => {
  isDragging.value = false
  if (props.disabled) return

  const files = event.dataTransfer.files
  if (files.length > 0) {
    validateAndEmitFile(files[0])
  }
}

const clearFile = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('update:modelValue', [])
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
