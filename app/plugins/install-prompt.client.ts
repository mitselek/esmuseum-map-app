/**
 * Makes the app installable and captures the browser's install offer early (#58)
 */

import { captureInstallPrompt } from '~/composables/useInstallPrompt'

export default defineNuxtPlugin(() => {
  captureInstallPrompt(window)

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      useClientLogger('install-prompt').warn('Service worker registration failed', error)
    })
  }
})
