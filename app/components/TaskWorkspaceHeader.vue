<template>
  <header class="border-b bg-white/95 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
      <!-- Left: Back button + Task title -->
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <button
          v-if="showClose"
          type="button"
          class="shrink-0 rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          :title="$t('taskDetail.close')"
          @click="$emit('close')"
        >
          {{ $t('taskDetail.close') }}
        </button>

        <!-- Task Title -->
        <h1 class="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900">
          {{ taskTitle || $t('tasks.title') }}
        </h1>
      </div>

      <!-- Right: Languages + Logout -->
      <div class="flex shrink-0 items-center gap-3">
        <div class="flex items-center gap-2">
          <button
            v-for="lang in languageButtons"
            :key="lang.code"
            class="text-lg transition-transform hover:scale-110"
            :title="lang.name"
            @click="switchLanguage(lang.code)"
          >
            {{ lang.flag }}
          </button>
        </div>

        <button
          v-if="isAuthenticated"
          type="button"
          class="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          :title="$t('logout')"
          @click="handleLogout"
        >
          <svg
            class="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9l3-3m0 0l3 3m-3-3v12"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Language code type
type LanguageCode = 'et' | 'en' | 'uk'

// Progress data interface
interface ProgressData {
  actual: number
  expected: number
}

// Props
interface Props {
  progress: ProgressData
  taskTitle?: string
  showClose?: boolean
}

withDefaults(defineProps<Props>(), {
  showClose: true,
  taskTitle: undefined
})

// Emits
interface Emits {
  (e: 'close'): void
}

defineEmits<Emits>()

const { locale, setLocale } = useI18n()
const { isAuthenticated, logout: authLogout } = useEntuAuth()

interface Language {
  code: LanguageCode
  name: string
  flag: string
}

const allLanguages: Language[] = [
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' }
]

const languageButtons = computed<Language[]>(() => {
  const otherLanguages = allLanguages.filter((lang) => lang.code !== locale.value)
  return otherLanguages.length > 0 ? otherLanguages : allLanguages
})

const switchLanguage = (langCode: LanguageCode): void => {
  setLocale(langCode)
}

const handleLogout = async (): Promise<void> => {
  await authLogout()
  await navigateTo('/login')
}
</script>
