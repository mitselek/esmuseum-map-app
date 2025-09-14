<template>
  <div
    v-if="showGPSPrompt && !permissionDenied"
    class="fixed inset-x-0 top-0 z-50 bg-blue-600 text-white shadow-lg"
  >
    <div class="mx-auto max-w-7xl px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="text-xl">
            📍
          </div>
          <div>
            <p class="text-sm font-medium">
              {{ $t('gps.enableLocationTitle') }}
            </p>
            <p class="text-xs text-blue-100">
              {{ $t('gps.enableLocationDescription') }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="button"
            :disabled="gettingLocation"
            class="rounded bg-white px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleAllowLocation"
          >
            <span v-if="gettingLocation">
              {{ $t('gps.requesting') }}...
            </span>
            <span v-else>
              {{ $t('gps.allowLocation') }}
            </span>
          </button>

          <button
            type="button"
            class="rounded border border-blue-400 px-3 py-1 text-xs text-blue-100 hover:bg-blue-500"
            @click="handleDismiss"
          >
            {{ $t('gps.notNow') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { showGPSPrompt, permissionDenied, gettingLocation, requestGPSPermission, dismissGPSPrompt } = useLocation()

const handleAllowLocation = async () => {
  await requestGPSPermission()
}

const handleDismiss = () => {
  dismissGPSPrompt()
}
</script>
