<template>
  <header class="border-b bg-white shadow-sm">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900">
          {{ $t('appName') }}
        </h1>
        <div class="flex items-center space-x-4">
          <!-- Language Switcher -->
          <div class="flex items-center space-x-2">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              class="text-lg transition-transform hover:scale-110"
              :title="lang.name"
              @click="switchLanguage(lang.code)"
            >
              {{ lang.flag }}
            </button>
          </div>

          <!-- Logout Button -->
          <button
            v-if="isAuthenticated"
            class="text-sm text-gray-600 hover:text-gray-900"
            @click="handleLogout"
          >
            {{ $t('logout') }}
          </button>

          <!-- Login Link -->
          <NuxtLink
            v-else
            to="/login"
            class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            {{ $t('login') }}
          </NuxtLink>
        </div>
      </div>

      <!-- User Greeting -->
      <p
        v-if="isAuthenticated && user"
        class="mt-1 text-sm text-gray-600"
      >
        {{ $t('hello') }}, {{ user.displayname || user.name || $t('student') }}!
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
// Language code type
type LanguageCode = 'et' | 'en' | 'uk'

// Composables
const { locale, setLocale } = useI18n()
const { isAuthenticated, user, logout: authLogout } = useEntuAuth()

// Language interface
interface Language {
  code: LanguageCode
  name: string
  flag: string
}

// Language configuration
const allLanguages: Language[] = [
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' }
]

// Computed property for available languages (excluding current)
const availableLanguages = computed<Language[]>(() => {
  return allLanguages.filter((lang) => lang.code !== locale.value)
})

// Language switching method
const switchLanguage = (langCode: LanguageCode): void => {
  setLocale(langCode)
}

// Logout method
const handleLogout = async (): Promise<void> => {
  await authLogout()
  await navigateTo('/login')
}
</script>
