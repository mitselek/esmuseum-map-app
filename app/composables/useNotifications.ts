/**
 * Notification Composable
 *
 * Provides a simple wrapper around Naive UI's notification system
 * with i18n support and consistent styling
 */

import { createDiscreteApi } from 'naive-ui'

// Create discrete notification API (doesn't require provider in template)
const { notification } = createDiscreteApi(['notification'])

/**
 * Notification options
 */
export interface NotificationOptions {
  title: string
  content?: string
  duration?: number // milliseconds, default 4000
  closable?: boolean // default true
}

/**
 * Show success notification
 */
export const notifySuccess = (options: NotificationOptions | string) => {
  const opts = typeof options === 'string'
    ? { title: options, duration: 4000, closable: true }
    : { duration: 4000, closable: true, ...options }

  notification.success(opts)
}

/**
 * Show error notification
 */
export const notifyError = (options: NotificationOptions | string) => {
  const opts = typeof options === 'string'
    ? { title: options, duration: 5000, closable: true }
    : { duration: 5000, closable: true, ...options }

  notification.error(opts)
}

/**
 * Show warning notification
 */
export const notifyWarning = (options: NotificationOptions | string) => {
  const opts = typeof options === 'string'
    ? { title: options, duration: 4500, closable: true }
    : { duration: 4500, closable: true, ...options }

  notification.warning(opts)
}

/**
 * Show info notification
 */
export const notifyInfo = (options: NotificationOptions | string) => {
  const opts = typeof options === 'string'
    ? { title: options, duration: 4000, closable: true }
    : { duration: 4000, closable: true, ...options }

  notification.info(opts)
}

/**
 * Show session expired notification
 *
 * Note: Uses useNuxtApp() instead of useI18n() because this can be
 * called from middleware context where useI18n() is not available
 *
 * Includes debouncing to prevent multiple notifications when several
 * API calls fail simultaneously
 */

// Track last notification time to prevent duplicates
let lastSessionExpiredNotification = 0
const SESSION_NOTIFICATION_COOLDOWN = 3000 // 3 seconds

export const notifySessionExpired = () => {
  if (!import.meta.client) return

  // Debounce: Don't show multiple notifications within cooldown period
  const now = Date.now()
  if (now - lastSessionExpiredNotification < SESSION_NOTIFICATION_COOLDOWN) {
    console.log('🔔 Skipping duplicate session expired notification (cooldown active)')
    return
  }
  lastSessionExpiredNotification = now

  const { $i18n } = useNuxtApp()

  notifyWarning({
    title: ($i18n as any).t('auth.sessionExpired'),
    content: ($i18n as any).t('auth.sessionExpiredMessage'),
    duration: 5000
  })
}

/**
 * Show auth required notification
 *
 * Note: Uses useNuxtApp() instead of useI18n() because this can be
 * called from middleware context where useI18n() is not available
 *
 * Includes debouncing to prevent multiple notifications when several
 * API calls fail simultaneously
 */

// Track last notification time to prevent duplicates
let lastAuthNotification = 0
const AUTH_NOTIFICATION_COOLDOWN = 3000 // 3 seconds

export const notifyAuthRequired = () => {
  if (!import.meta.client) return

  // Debounce: Don't show multiple notifications within cooldown period
  const now = Date.now()
  if (now - lastAuthNotification < AUTH_NOTIFICATION_COOLDOWN) {
    console.log('🔔 Skipping duplicate auth notification (cooldown active)')
    return
  }
  lastAuthNotification = now

  const { $i18n } = useNuxtApp()

  notifyError({
    title: ($i18n as any).t('auth.authRequired'),
    content: ($i18n as any).t('auth.authRequiredMessage'),
    duration: 4000
  })
}

/**
 * Composable for notifications
 */
export function useNotifications () {
  return {
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo,
    sessionExpired: notifySessionExpired,
    authRequired: notifyAuthRequired
  }
}
