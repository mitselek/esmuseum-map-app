/**
 * "Install as app" prompt (#58)
 *
 * Chromium browsers fire `beforeinstallprompt` when the app is installable.
 * The event can fire before any component mounts, so a client plugin calls
 * captureInstallPrompt() at startup; components read the shared state.
 * iOS Safari never fires the event, so canInstall stays false there.
 */

import { ref, computed, readonly } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

// Singleton state - shared across all instances
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(false)

const isStandalone = (target: Window): boolean =>
  target.matchMedia?.('(display-mode: standalone)').matches ?? false

export function captureInstallPrompt (target: Window): void {
  if (isStandalone(target)) {
    installed.value = true
    return
  }

  target.addEventListener('beforeinstallprompt', (event: Event) => {
    // Keep Chrome's own mini-infobar away; the header button offers install instead
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  })

  target.addEventListener('appinstalled', () => {
    installed.value = true
    deferredPrompt.value = null
  })
}

/** Test helper: forget captured state */
export function resetInstallPrompt (): void {
  deferredPrompt.value = null
  installed.value = false
}

export function useInstallPrompt () {
  const canInstall = computed(() => !installed.value && deferredPrompt.value !== null)

  const install = async (): Promise<InstallOutcome> => {
    const event = deferredPrompt.value
    if (!event) return 'unavailable'

    // A prompt event can be used only once, whatever the user chooses
    deferredPrompt.value = null
    await event.prompt()
    const { outcome } = await event.userChoice
    return outcome
  }

  return {
    canInstall: readonly(canInstall),
    install
  }
}
