<template>
  <div class="min-h-screen bg-gray-50">
    <!-- App Header -->
    <AppHeader />

    <div class="flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-extrabold text-gray-900">
            {{ $t('profile.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            {{ $t('profile.subtitle') }}
          </p>
        </div>

        <!-- Name Collection Form -->
        <div class="rounded-lg bg-white p-8 shadow-md">
          <form
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <div>
              <label
                for="forename"
                class="block text-sm font-medium text-gray-700"
              >
                {{ $t('profile.forename') }} *
              </label>
              <input
                id="forename"
                v-model="formData.forename"
                type="text"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                :placeholder="$t('profile.forenamePlaceholder')"
              >
            </div>

            <div>
              <label
                for="surname"
                class="block text-sm font-medium text-gray-700"
              >
                {{ $t('profile.surname') }} *
              </label>
              <input
                id="surname"
                v-model="formData.surname"
                type="text"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                :placeholder="$t('profile.surnamePlaceholder')"
              >
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="rounded-md bg-red-50 p-4"
            >
              <p class="text-sm text-red-800">
                {{ error }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !formData.forename || !formData.surname"
              class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isSubmitting ? $t('profile.submitting') : $t('profile.submit') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { token, user } = useEntuAuth()

// Form state
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const formData = ref({
  forename: '',
  surname: ''
})

// Pre-fill form with existing values if available
onMounted(() => {
  if (user.value) {
    formData.value.forename = user.value.forename || ''
    formData.value.surname = user.value.surname || ''
  }
})

/**
 * Submit name to Entu and update localStorage
 */
async function handleSubmit() {
  if (!token.value || !user.value) {
    error.value = 'Authentication required'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const userId = user.value._id
    const userToken = token.value

    // Call Entu API to update user's forename/surname
    const { updateUserName } = await import('../../utils/entu-client')
    await updateUserName(
      userId,
      formData.value.forename,
      formData.value.surname,
      userToken
    )

    // Refresh user data by calling getToken() which fetches fresh user info
    const { getToken } = useEntuAuth()
    await getToken()

    // Get redirect path from localStorage
    const redirectPath = localStorage.getItem('profile_redirect') || '/'
    
    // Clear the redirect flag
    localStorage.removeItem('profile_redirect')

    // Redirect back to original page
    router.push(redirectPath)
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
    console.error('Profile update error:', err)
  }
  finally {
    isSubmitting.value = false
  }
}

// Set page title
const { t } = useI18n()
useHead({
  title: t('profile.pageTitle')
})
</script>

<i18n lang="yaml">
en:
  profile:
    title: Complete Your Profile
    subtitle: Please provide your name to continue
    forename: First Name
    forenamePlaceholder: Enter your first name
    surname: Last Name
    surnamePlaceholder: Enter your last name
    submit: Save Profile
    submitting: Saving...
    pageTitle: Profile Setup
et:
  profile:
    title: Täida Oma Profiil
    subtitle: Palun sisesta oma nimi jätkamiseks
    forename: Eesnimi
    forenamePlaceholder: Sisesta oma eesnimi
    surname: Perekonnanimi
    surnamePlaceholder: Sisesta oma perekonnanimi
    submit: Salvesta Profiil
    submitting: Salvestamine...
    pageTitle: Profiili Seadistamine
uk:
  profile:
    title: Заповніть Свій Профіль
    subtitle: Будь ласка, вкажіть ваше ім'я для продовження
    forename: Ім'я
    forenamePlaceholder: Введіть ваше ім'я
    surname: Прізвище
    surnamePlaceholder: Введіть ваше прізвище
    submit: Зберегти Профіль
    submitting: Збереження...
    pageTitle: Налаштування Профілю
lv:
  profile:
    title: Aizpildiet Savu Profilu
    subtitle: Lūdzu, norādiet savu vārdu, lai turpinātu
    forename: Vārds
    forenamePlaceholder: Ievadiet savu vārdu
    surname: Uzvārds
    surnamePlaceholder: Ievadiet savu uzvārdu
    submit: Saglabāt Profilu
    submitting: Saglabāšana...
    pageTitle: Profila Iestatīšana
</i18n>
