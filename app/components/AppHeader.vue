<template>
  <div class="bg-blue-800 px-4 py-2 text-white">
    <div class="container mx-auto flex items-center justify-between">
      <NuxtLink
        to="/"
        class="text-xl font-bold no-underline"
      >{{ $t('appName') }}</NuxtLink>
      <div class="flex items-center space-x-4">
        <!-- Authentication status -->
        <div
          v-if="isAuthenticated"
          class="flex items-center space-x-4"
        >
          <span class="hidden text-sm md:inline-block">{{ user?.name || user?.email || $t('loggedIn') }}</span>
          <button
            class="rounded bg-red-600 px-2 py-1 text-sm hover:bg-red-700"
            @click="logout"
          >
            {{ $t('logout') }}
          </button>
        </div>
        <div v-else>
          <NuxtLink
            to="/login"
            class="rounded bg-green-600 px-2 py-1 text-sm hover:bg-green-700"
          >
            {{ $t('login') }}
          </NuxtLink>
        </div>

        <!-- Language switcher with flags -->
        <div class="flex items-center space-x-2">
          <button
            v-if="currentLocale !== 'et'"
            title="Eesti keel"
            class="rounded bg-blue-700 px-2 py-1 text-sm text-white transition-colors hover:bg-blue-600"
            @click="currentLocale = 'et'"
          >
            🇪🇪
          </button>
          <button
            v-if="currentLocale !== 'en'"
            title="English"
            class="rounded bg-blue-700 px-2 py-1 text-sm text-white transition-colors hover:bg-blue-600"
            @click="currentLocale = 'en'"
          >
            🇬🇧
          </button>
          <button
            v-if="currentLocale !== 'uk'"
            title="Українська"
            class="rounded bg-blue-700 px-2 py-1 text-sm text-white transition-colors hover:bg-blue-600"
            @click="currentLocale = 'uk'"
          >
            🇺🇦
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { locale, setLocale } = useI18n()
const { isAuthenticated, user, logout } = useEntuAuth()

// Ensure locale changes are handled properly
const currentLocale = computed({
  get: () => locale.value,
  set: (value) => setLocale(value)
})
</script>
