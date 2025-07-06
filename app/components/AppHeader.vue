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

        <!-- Language toggle -->
        <button
          class="rounded bg-blue-700 px-2 py-1 text-sm hover:bg-blue-600"
          @click="toggleLocale"
        >
          {{ $t('changeLanguage') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const { isAuthenticated, user, logout } = useEntuAuth()

const toggleLocale = () => {
  locale.value = locale.value === 'et' ? 'en' : 'et'
}
</script>

<i18n lang="yaml">
en:
  appName: ESMuseum Map
  changeLanguage: Switch to Estonian
  login: Login
  logout: Logout
  loggedIn: Logged in
et:
  appName: ESMuseumi kaart
  changeLanguage: Lülitu inglise keelele
  login: Logi sisse
  logout: Logi välja
  loggedIn: Sisse logitud
</i18n>
