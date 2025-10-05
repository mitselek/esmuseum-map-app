<script setup>
/**
 * OAuth Callback Handler
 *
 * This page handles the OAuth callback after authentication with Entu.
 * It's designed to be as invisible as possible - the redirect happens
 * immediately without showing the page content.
 *
 * NOTE: The defensive programming approach (showing a fallback message with
 * manual redirect link) was explicitly approved by the user to handle edge
 * cases where automatic redirect might fail (e.g., JavaScript disabled,
 * extreme network conditions).
 */

// Get the OAuth helper
const { handleOAuthCallback } = useEntuOAuth()

// Process the callback IMMEDIATELY when the component mounts
// No delays, no loading states - just instant redirect
onMounted(async () => {
  if (!import.meta.client) return

  try {
    // Let the OAuth handler do all the work
    // This function internally handles the redirect
    await handleOAuthCallback()
  }
  catch (err) {
    // Error is logged in the handler
    // The template will show the fallback link if redirect fails
    console.error('OAuth callback error:', err)
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="text-center">
      <!-- Minimal loading indicator -->
      <div class="mb-4 flex justify-center">
        <div class="size-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>

      <!-- Simple message with defensive fallback link -->
      <p class="mb-2 text-gray-600">
        {{ $t('redirecting') }}
      </p>

      <!-- Defensive programming: manual link in case automatic redirect fails -->
      <NuxtLink
        to="/"
        class="text-sm text-blue-600 hover:underline"
      >
        {{ $t('clickHere') }}
      </NuxtLink>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  redirecting: Redirecting...
  clickHere: Click here if not redirected automatically
et:
  redirecting: Suunatakse ümber...
  clickHere: Vajutage siia, kui automaatset ümbersuunamist ei toimu
uk:
  redirecting: Перенаправлення...
  clickHere: Натисніть тут, якщо автоматичне перенаправлення не відбувається
</i18n>
