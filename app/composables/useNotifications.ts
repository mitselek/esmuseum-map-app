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
 */
export const notifySessionExpired = () => {
  const { t } = useI18n()
  
  notifyWarning({
    title: t('auth.sessionExpired'),
    content: t('auth.sessionExpiredMessage'),
    duration: 5000
  })
}

/**
 * Show auth required notification
 */
export const notifyAuthRequired = () => {
  const { t } = useI18n()
  
  notifyError({
    title: t('auth.authRequired'),
    content: t('auth.authRequiredMessage'),
    duration: 4000
  })
}

/**
 * Composable for notifications
 */
export function useNotifications() {
  return {
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo,
    sessionExpired: notifySessionExpired,
    authRequired: notifyAuthRequired
  }
}
