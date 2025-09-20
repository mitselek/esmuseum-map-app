<template>
  <div class="fixed inset-0 bg-red-600 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-2xl max-w-md mx-4">
      <div class="flex items-center mb-4">
        <svg class="w-8 h-8 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <h2 class="text-xl font-bold text-red-600">Application Error</h2>
      </div>
      
      <div class="mb-4">
        <p class="text-gray-800 font-semibold mb-2">
          This application cannot function without localStorage access.
        </p>
        <p class="text-gray-600 text-sm mb-3">
          {{ errorMessage }}
        </p>
      </div>
      
      <div class="bg-red-50 border border-red-200 rounded p-3 mb-4">
        <p class="text-red-800 text-sm">
          <strong>Possible solutions:</strong>
        </p>
        <ul class="text-red-700 text-sm mt-1 list-disc list-inside">
          <li>Enable cookies and local storage in your browser</li>
          <li>Disable private/incognito browsing mode</li>
          <li>Check browser extensions that might block storage</li>
          <li>Try refreshing the page</li>
        </ul>
      </div>
      
      <button 
        @click="reloadPage"
        class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  errorMessage: string
}

defineProps<Props>()

const reloadPage = () => {
  window.location.reload()
}
</script>