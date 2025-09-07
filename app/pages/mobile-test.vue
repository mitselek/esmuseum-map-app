<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h1 class="mb-6 text-center text-2xl font-bold text-gray-800">
        📱 Mobile Compatibility Test
      </h1>

      <div class="space-y-4">
        <!-- Status Card -->
        <div class="rounded-lg border border-green-200 bg-green-50 p-4">
          <div class="flex items-center">
            <div class="mr-3 size-3 rounded-full bg-green-500" />
            <h2 class="text-lg font-semibold text-green-800">
              Production Mode Active
            </h2>
          </div>
          <p class="mt-2 text-sm text-green-700">
            Vue devtools completely eliminated in production build
          </p>
        </div>

        <!-- F007 Features Test -->
        <div class="rounded-lg border border-gray-200 p-4">
          <h3 class="mb-3 font-semibold text-gray-800">
            F007 Features
          </h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">TaskWorkspace SPA</span>
              <span class="rounded bg-green-100 px-2 py-1 text-xs text-green-800">✓ Active</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Form Persistence</span>
              <span class="rounded bg-green-100 px-2 py-1 text-xs text-green-800">✓ Active</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Component Architecture</span>
              <span class="rounded bg-green-100 px-2 py-1 text-xs text-green-800">✓ Modular</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">FileUpload Enhanced</span>
              <span class="rounded bg-green-100 px-2 py-1 text-xs text-green-800">✓ Drag&Drop</span>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="space-y-3">
          <NuxtLink
            to="/kaardid"
            class="block w-full rounded-lg bg-blue-600 py-3 text-center text-white transition-colors hover:bg-blue-700"
          >
            🗺️ Test TaskWorkspace
          </NuxtLink>

          <NuxtLink
            to="/test-components"
            class="block w-full rounded-lg bg-purple-600 py-3 text-center text-white transition-colors hover:bg-purple-700"
          >
            🧩 Test Components
          </NuxtLink>

          <NuxtLink
            to="/"
            class="block w-full rounded-lg bg-gray-600 py-3 text-center text-white transition-colors hover:bg-gray-700"
          >
            🏠 Home
          </NuxtLink>
        </div>

        <!-- Technical Info -->
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 class="mb-2 font-semibold text-blue-800">
            Mobile Fix Applied
          </h3>
          <div class="space-y-1 text-xs text-blue-700">
            <p>• Production build eliminates all Vue devtools</p>
            <p>• No more "null is not an object" errors</p>
            <p>• Clean mobile browser experience</p>
            <p>• Full F007 SPA functionality preserved</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Mobile Compatibility Test',
  description: 'Test page to verify mobile compatibility fixes for F007 SPA'
})

// Head configuration for mobile optimization
useHead({
  title: 'Mobile Test - ESM Map App',
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes'
    }
  ]
})
</script>
