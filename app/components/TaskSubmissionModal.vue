<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-200"
          enter-from-class="scale-95 opacity-0"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="isOpen"
            class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
          >
            <!-- Submitting state -->
            <div
              v-if="status === 'submitting'"
              class="flex items-center gap-3"
            >
              <div class="size-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p class="text-lg">
                {{ $t('taskDetail.modalSubmitting') }}
              </p>
            </div>

            <!-- Success state -->
            <div
              v-else-if="status === 'success'"
              class="flex items-center gap-3 text-green-600"
            >
              <svg
                class="size-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="text-lg font-medium">
                {{ $t('taskDetail.modalSubmitSuccess') }}
              </p>
            </div>

            <!-- Error state -->
            <div
              v-else-if="status === 'error'"
              class="flex flex-col gap-3"
            >
              <div class="flex items-center gap-3 text-red-600">
                <svg
                  class="size-6 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p class="text-lg font-medium">
                  {{ $t('taskDetail.modalSubmitError') }}
                </p>
              </div>

              <p
                v-if="errorMessage"
                class="text-sm text-gray-600"
              >
                {{ errorMessage }}
              </p>

              <div class="mt-2 flex gap-2">
                <button
                  type="button"
                  class="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  @click="$emit('retry')"
                >
                  {{ $t('common.retry') }}
                </button>
                <button
                  type="button"
                  class="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  @click="$emit('close')"
                >
                  {{ $t('taskDetail.cancel') }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  status: 'submitting' | 'success' | 'error'
  errorMessage?: string
}

defineProps<Props>()

const emit = defineEmits<{
  retry: []
  close: []
}>()

// Don't allow closing modal by clicking backdrop during submission
const handleBackdropClick = () => {
  // Only allow backdrop close on error state
  if (defineProps<Props>().status === 'error') {
    emit('close')
  }
}
</script>
