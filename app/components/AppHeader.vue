<template>
  <header class="border-b bg-white shadow-sm">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <!-- {{ title || $t('appName') }} -->
          <!-- Install as app (#58): only where the browser offers it -->
          <button
            v-if="canInstall"
            class="rounded border border-esm-blue px-3 py-1 text-sm text-esm-blue hover:bg-esm-blue hover:text-white"
            @click="install"
          >
            {{ $t('installApp') }}
          </button>
        </div>
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
            class="flex min-w-0 flex-col items-end text-sm text-gray-600 hover:text-gray-900"
            :title="sessionAccount || undefined"
            @click="handleLogout"
          >
            <span>{{ $t('logout') }}</span>
            <span
              v-if="sessionLabel"
              class="max-w-[40vw] truncate text-xs text-gray-500"
            >
              {{ sessionLabel }}
            </span>
          </button>

          <!-- Login Link -->
          <NuxtLink
            v-else-if="!isLoginPage"
            to="/login"
            class="rounded bg-esm-blue px-3 py-1 text-sm text-white hover:bg-esm-dark"
          >
            {{ $t('login') }}
          </NuxtLink>
        </div>
      </div>

      <!-- User Greeting -->
      <p
        v-if="showGreeting && isAuthenticated && user"
        class="mt-1 text-sm text-gray-600"
      >
        {{ $t('hello') }}, {{ user.displayname || user.name || $t('student') }}!
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { getSessionAccount, shortenAccount } from '~/utils/session-identity'
import { useInstallPrompt } from '~/composables/useInstallPrompt'
// Language code type
type LanguageCode = 'et' | 'en' | 'uk' | 'lv'

// Props
interface Props {
  title?: string
  showGreeting?: boolean
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  showGreeting: true
})

// Composables
const { locale, setLocale } = useI18n()
const { isAuthenticated, user, authResponse, logout: authLogout } = useEntuAuth()
const { canInstall, install } = useInstallPrompt()

// Which account is signed in, shown under the logout link (#57)
const sessionAccount = computed(() => getSessionAccount(user.value, authResponse.value))
const sessionLabel = computed(() => shortenAccount(sessionAccount.value))
const route = useRoute()

// Check if we're on login page
const isLoginPage = computed(() => route.path === '/login')

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
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' }
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
