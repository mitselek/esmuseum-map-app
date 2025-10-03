<template>
  <!-- Only show after user has denied permission -->
  <div
    v-if="permissionDenied"
    class="fixed inset-x-0 top-0 z-50 bg-amber-600 text-white shadow-lg"
  >
    <div class="mx-auto max-w-7xl px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="text-xl">
            ⚠️
          </div>
          <div>
            <p class="text-sm font-medium">
              {{ $t('gps.locationRequiredTitle') }}
            </p>
            <p class="text-xs text-amber-100">
              {{ canRetry ? $t('gps.locationRequiredRetry') : $t('gps.locationRequiredInstructions') }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Show "Try Again" if permission state is still 'prompt' -->
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

          <!-- Show "Help" link if permission is permanently denied -->
          <a
            v-else
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
            {{ $t('gps.dismiss') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { permissionDenied, gettingLocation, requestGPSPermission, checkGeolocationPermission } = useLocation()

// Check if user can retry (permission state is still 'prompt' not permanently 'denied')
const canRetry = ref(false)

// Check permission state when component mounts
onMounted(async () => {
  const state = await checkGeolocationPermission()
  canRetry.value = state === 'prompt'
})

const handleRetry = async () => {
  console.log('🌍 [EVENT] GPSPermissionPrompt - User retrying GPS request')
  await requestGPSPermission()
  
  // Recheck if still denied after attempt
  const state = await checkGeolocationPermission()
  canRetry.value = state === 'prompt'
  console.log('🌍 [EVENT] GPSPermissionPrompt - Retry completed, can retry:', canRetry.value)
}

const handleDismiss = () => {
  console.log('🌍 [EVENT] GPSPermissionPrompt - User dismissed help banner')
  // Banner will hide itself via v-if="permissionDenied"
  // User can always re-enable via browser settings
}
</script>
