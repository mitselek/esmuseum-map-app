<template>
  <div class="mb-6">
    <label class="mb-2 block text-sm font-medium text-gray-700">
      {{ $t('taskDetail.addFile') }}
    </label>

    <!-- File upload area -->
    <div
      :class="[
        'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
        isDragOver
          ? 'border-esm-blue bg-esm-beige'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
      ]"
      @click="triggerFileInput"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @dragenter.prevent
    >
      <div v-if="!files.length">
        <div class="mb-2 text-2xl">
          📎
        </div>
        <p class="mb-1 text-sm font-medium text-gray-700">
          {{ $t('taskDetail.dragDropFiles') }}
        </p>
        <p class="text-xs text-gray-500">
          {{ $t('taskDetail.allowedFiles') }}
        </p>
        <p class="mt-2 text-xs text-gray-400">
          {{ $t('taskDetail.maxFileSize') }}
        </p>
      </div>

      <!-- File preview list -->
      <div
        v-else
        class="space-y-2"
      >
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center justify-between rounded bg-white p-3 shadow-sm"
        >
          <div class="flex items-center space-x-3">
            <div class="text-lg">
              {{ getFileIcon(file.type) }}
            </div>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900">
                {{ file.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(file.size) }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="text-red-500 hover:text-red-700"
            @click.stop="removeFile(index)"
          >
            ❌
          </button>
        </div>

        <!-- Add more files button -->
        <div class="mt-3 border-t border-gray-200 pt-3">
          <p class="text-xs text-gray-500">
            {{ $t('taskDetail.clickToAddMore') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleFileInput"
    >

    <!-- Error message -->
    <div
      v-if="error"
      class="mt-2 text-sm text-red-600"
    >
      {{ error }}
    </div>

    <!-- File upload progress -->
    <div
      v-if="uploadProgress.length"
      class="mt-3 space-y-2"
    >
      <div
        v-for="(progress, index) in uploadProgress"
        :key="index"
        class="rounded bg-gray-100 p-2"
      >
        <div class="flex items-center justify-between text-xs text-gray-600">
          <span>{{ progress.filename }}</span>
          <span>{{ progress.status }}</span>
        </div>
        <div class="mt-1 h-1 w-full rounded bg-gray-200">
          <div
            class="h-1 rounded bg-esm-blue transition-all"
            :style="{ width: `${progress.percent}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { t } = useI18n()

// F015: Client-side file upload composable
const { upload: uploadWithFeatureFlag } = useClientSideFileUpload()

// Component state
const files = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const error = ref('')
const uploadProgress = ref<Array<{ filename: string, percent: number, status: string }>>([])

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]

// Types
interface UploadResult {
  filename: string
  success: boolean
  entityId?: string
  size?: number
  type?: string
  error?: string
}

// Emits
const emit = defineEmits<{
  'update:files': [files: File[]]
  'upload-complete': [results: UploadResult[]]
  'upload-error': [error: Error]
}>()

// File validation
const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return t('taskDetail.fileTooLarge', { name: file.name, maxSize: '10MB' })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return t('taskDetail.fileTypeNotAllowed', { name: file.name })
  }

  return null
}

// File handling
const addFiles = (newFiles: File[]) => {
  error.value = ''
  const validFiles: File[] = []

  for (const file of newFiles) {
    const validationError = validateFile(file)
    if (validationError) {
      error.value = validationError
      return
    }

    // Check for duplicates
    const isDuplicate = files.value.some((existingFile) =>
      existingFile.name === file.name && existingFile.size === file.size
    )

    if (!isDuplicate) {
      validFiles.push(file)
    }
  }

  if (validFiles.length > 0) {
    files.value.push(...validFiles)
    emit('update:files', files.value)
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
  emit('update:files', files.value)
}

const clearFiles = () => {
  files.value = []
  uploadProgress.value = []
  error.value = ''
  emit('update:files', files.value)
}

// Event handlers
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  if (selectedFiles.length > 0) {
    addFiles(selectedFiles)
  }
  // Clear input to allow selecting same file again
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const droppedFiles = Array.from(event.dataTransfer?.files || [])
  if (droppedFiles.length > 0) {
    addFiles(droppedFiles)
  }
}

// Utility functions
const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  return '📎'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// File upload using F015 client-side implementation with server fallback
const uploadFiles = async (parentEntityId: string): Promise<UploadResult[]> => {
  if (!files.value.length) return []

  uploadProgress.value = files.value.map((file) => ({
    filename: file.name,
    percent: 0,
    status: t('taskDetail.preparing')
  }))

  try {
    console.log('F015: Starting file upload with feature flag routing')

    // Progress callback for client-side uploads
    const progressCallback = (fileIndex: number, status: string, percent: number) => {
      if (uploadProgress.value[fileIndex]) {
        uploadProgress.value[fileIndex].percent = percent
        uploadProgress.value[fileIndex].status = status
      }
    }

    // Use feature-flag controlled upload (client-side or server fallback)
    const uploadResults = await uploadWithFeatureFlag(
      parentEntityId,
      files.value,
      progressCallback
    )

    console.log('F015: Upload completed:', uploadResults)

    // Update progress to complete for successful uploads
    uploadProgress.value.forEach((progress, index) => {
      const result = uploadResults[index]
      if (result && result.success) {
        progress.percent = 100
        progress.status = t('taskDetail.uploadComplete')
      }
      else {
        progress.percent = 0
        progress.status = t('taskDetail.uploadFailed')
      }
    })

    emit('upload-complete', uploadResults)
    return uploadResults
  }
  catch (error: unknown) {
    const uploadError = error instanceof Error ? error : new Error('Upload failed')
    console.error('F015: Upload process failed:', uploadError)

    // Update progress to show error
    uploadProgress.value.forEach((progress) => {
      progress.percent = 0
      progress.status = t('taskDetail.uploadFailed')
    })

    emit('upload-error', uploadError)
    throw uploadError
  }
}

// Expose methods to parent
defineExpose({
  uploadFiles,
  clearFiles,
  files: files.value
})
</script>
