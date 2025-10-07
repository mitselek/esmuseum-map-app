<template>
  <!-- Show for permission denied OR location errors (but not for simple prompt states) -->
  <div
    v-if="permissionDenied || (locationError && !gettingLocation)"
    class="fixed inset-x-0 top-0 z-50 bg-amber-600 text-white shadow-lg"
  >
    <div class="mx-auto max-w-7xl px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="text-xl">
            {{ getErrorIcon() }}
          </div>
          <div>
            <p class="text-sm font-medium">
              {{ getErrorTitle() }}
            </p>
            <p class="text-xs text-amber-100">
              {{ getErrorMessage() }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Show "Try Again" for recoverable errors -->
          <button
            v-if="canRetry"
            type="button"
            :disabled="gettingLocation"
            class="rounded bg-white px-3 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleRetry"
          >
            <span v-if="gettingLocation">
              {{ $t('gps.requesting') }}...
            </span>
            <span v-else>
              {{ $t('gps.tryAgain') }}
            </span>
          </button>

          <!-- Show "Help" link for permission issues -->
          <a
            v-if="isPermissionError && !canRetry"
            href="https://support.google.com/chrome/answer/142065"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded bg-white px-3 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50"
          >
            {{ $t('gps.howToEnable') }}
          </a>

          <button
            type="button"
            class="rounded border border-amber-400 px-3 py-1 text-xs text-amber-100 hover:bg-amber-500"
            @click="handleDismiss"
          >
            {{ locationError ? $t('gps.error.continueWithoutGPS') : $t('gps.dismiss') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  permissionDenied,
  gettingLocation,
  locationError,
  requestGPSPermission,
  checkGeolocationPermission,
  dismissGPSPrompt
} = useLocation()

// Get translation function
const { t } = useI18n()

// Check if user can retry (permission state is still 'prompt' not permanently 'denied')
const canRetry = ref<boolean>(false)

// Computed properties for error handling
const isPermissionError = computed(() => {
  return permissionDenied.value
    || (locationError.value && locationError.value.includes('denied'))
})

const isPositionUnavailable = computed(() => {
  return locationError.value && locationError.value.includes('unavailable')
})

const isTimeout = computed(() => {
  return locationError.value && locationError.value.includes('timed out')
})

// Helper functions for dynamic content
const getErrorIcon = (): string => {
  if (isPermissionError.value) return '🔒'
  if (isPositionUnavailable.value) return '📍'
  if (isTimeout.value) return '⏱️'
  return '⚠️'
}

const getErrorTitle = (): string => {
  if (isPermissionError.value) return t('gps.error.permissionTitle')
  if (isPositionUnavailable.value) return t('gps.error.unavailableTitle')
  if (isTimeout.value) return t('gps.error.timeoutTitle')
  return t('gps.error.genericTitle')
}

const getErrorMessage = (): string => {
  if (locationError.value) {
    return locationError.value
  }
  if (permissionDenied.value) {
    return canRetry.value
      ? t('gps.error.permissionRetry')
      : t('gps.error.permissionBlocked')
  }
  return t('gps.error.serviceIssue')
}

// Check permission state when component mounts
onMounted(async () => {
  const state = await checkGeolocationPermission()
  canRetry.value = state === 'prompt' || state === 'unknown'
})

// Update canRetry when locationError changes
watch(locationError, async () => {
  if (locationError.value) {
    // For non-permission errors, allow retry
    if (!locationError.value.includes('denied')) {
      canRetry.value = true
    }
  }
})

const handleRetry = async (): Promise<void> => {
  console.log('🌍 [EVENT] GPSPermissionPrompt - User retrying GPS request')
  await requestGPSPermission()

  // Recheck if still denied after attempt
  const state = await checkGeolocationPermission()
  canRetry.value = state === 'prompt' || state === 'unknown'
  console.log('🌍 [EVENT] GPSPermissionPrompt - Retry completed, can retry:', canRetry.value)
}

const handleDismiss = (): void => {
  console.log('🌍 [EVENT] GPSPermissionPrompt - User dismissed location prompt')
  dismissGPSPrompt()
}
</script>
