/**
 * Tests for useNotifications composable
 *
 * Tests notification display functions and debouncing behavior
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock naive-ui's createDiscreteApi
const mockNotification = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn()
}

vi.mock('naive-ui', () => ({
  createDiscreteApi: () => ({
    notification: mockNotification
  })
}))

// Mock useClientLogger
vi.mock('~/composables/useClientLogger', () => ({
  useClientLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// Mock useNuxtApp for session expired / auth required notifications
const mockI18n = {
  t: vi.fn((key: string) => key)
}

vi.stubGlobal('useNuxtApp', () => ({
  $i18n: mockI18n
}))

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Re-import after mocks are set up
  // Use dynamic import to ensure mocks are applied
  const getModule = async () => await import('~/composables/useNotifications')

  describe('notifySuccess', () => {
    it('should show success notification with string', async () => {
      const { notifySuccess } = await getModule()

      notifySuccess('Upload complete')

      expect(mockNotification.success).toHaveBeenCalledWith({
        title: 'Upload complete',
        duration: 4000,
        closable: true
      })
    })

    it('should show success notification with options object', async () => {
      const { notifySuccess } = await getModule()

      notifySuccess({ title: 'Done', content: 'File saved', duration: 2000 })

      expect(mockNotification.success).toHaveBeenCalledWith({
        title: 'Done',
        content: 'File saved',
        duration: 2000,
        closable: true
      })
    })

    it('should allow overriding closable', async () => {
      const { notifySuccess } = await getModule()

      notifySuccess({ title: 'Done', closable: false })

      expect(mockNotification.success).toHaveBeenCalledWith(
        expect.objectContaining({ closable: false })
      )
    })
  })

  describe('notifyError', () => {
    it('should show error notification with 5000ms duration by default', async () => {
      const { notifyError } = await getModule()

      notifyError('Something failed')

      expect(mockNotification.error).toHaveBeenCalledWith({
        title: 'Something failed',
        duration: 5000,
        closable: true
      })
    })
  })

  describe('notifyWarning', () => {
    it('should show warning notification with 4500ms duration by default', async () => {
      const { notifyWarning } = await getModule()

      notifyWarning('Caution')

      expect(mockNotification.warning).toHaveBeenCalledWith({
        title: 'Caution',
        duration: 4500,
        closable: true
      })
    })
  })

  describe('notifyInfo', () => {
    it('should show info notification with 4000ms duration by default', async () => {
      const { notifyInfo } = await getModule()

      notifyInfo('FYI')

      expect(mockNotification.info).toHaveBeenCalledWith({
        title: 'FYI',
        duration: 4000,
        closable: true
      })
    })
  })

  describe('notifyError with options object', () => {
    it('should accept options object with custom duration', async () => {
      const { notifyError } = await getModule()

      notifyError({ title: 'Error', content: 'Details', duration: 8000 })

      expect(mockNotification.error).toHaveBeenCalledWith({
        title: 'Error',
        content: 'Details',
        duration: 8000,
        closable: true
      })
    })
  })

  describe('notifyWarning with options object', () => {
    it('should accept options object', async () => {
      const { notifyWarning } = await getModule()

      notifyWarning({ title: 'Warn', content: 'Be careful' })

      expect(mockNotification.warning).toHaveBeenCalledWith({
        title: 'Warn',
        content: 'Be careful',
        duration: 4500,
        closable: true
      })
    })
  })

  describe('notifyInfo with options object', () => {
    it('should accept options object', async () => {
      const { notifyInfo } = await getModule()

      notifyInfo({ title: 'Info', content: 'Note this', duration: 6000, closable: false })

      expect(mockNotification.info).toHaveBeenCalledWith({
        title: 'Info',
        content: 'Note this',
        duration: 6000,
        closable: false
      })
    })
  })

  describe('notifySessionExpired', () => {
    it('should show warning notification with i18n keys', async () => {
      // Use fake timers to jump past any previous debounce cooldown
      vi.useFakeTimers()
      vi.setSystemTime(Date.now() + 10000)
      vi.clearAllMocks()

      const { notifySessionExpired } = await getModule()

      notifySessionExpired()

      expect(mockI18n.t).toHaveBeenCalledWith('auth.sessionExpired')
      expect(mockI18n.t).toHaveBeenCalledWith('auth.sessionExpiredMessage')
      expect(mockNotification.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'auth.sessionExpired',
          content: 'auth.sessionExpiredMessage',
          duration: 5000
        })
      )

      vi.useRealTimers()
    })

    it('should debounce duplicate calls within cooldown', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(Date.now() + 20000) // Jump past any prior debounce
      vi.clearAllMocks()

      const { notifySessionExpired } = await getModule()

      notifySessionExpired()
      notifySessionExpired() // Should be debounced

      expect(mockNotification.warning).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should allow calls after cooldown period', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(Date.now() + 30000) // Jump past any prior debounce
      vi.clearAllMocks()

      const { notifySessionExpired } = await getModule()

      notifySessionExpired()
      expect(mockNotification.warning).toHaveBeenCalledTimes(1)

      // Advance time past cooldown (3000ms)
      vi.advanceTimersByTime(3100)

      notifySessionExpired()
      expect(mockNotification.warning).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })
  })

  describe('notifyAuthRequired', () => {
    it('should show error notification with i18n keys', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(Date.now() + 40000) // Jump past any prior debounce
      vi.clearAllMocks()

      const { notifyAuthRequired } = await getModule()

      notifyAuthRequired()

      expect(mockI18n.t).toHaveBeenCalledWith('auth.authRequired')
      expect(mockI18n.t).toHaveBeenCalledWith('auth.authRequiredMessage')
      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'auth.authRequired',
          content: 'auth.authRequiredMessage',
          duration: 4000
        })
      )

      vi.useRealTimers()
    })

    it('should debounce duplicate calls within cooldown', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(Date.now() + 50000) // Jump past any prior debounce
      vi.clearAllMocks()

      const { notifyAuthRequired } = await getModule()

      notifyAuthRequired()
      notifyAuthRequired() // Should be debounced

      expect(mockNotification.error).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should allow calls after cooldown period', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(Date.now() + 60000) // Jump past any prior debounce
      vi.clearAllMocks()

      const { notifyAuthRequired } = await getModule()

      notifyAuthRequired()
      expect(mockNotification.error).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(3100)

      notifyAuthRequired()
      expect(mockNotification.error).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })
  })

  describe('useNotifications composable', () => {
    it('should return all notification functions', async () => {
      const { useNotifications } = await getModule()

      const notifications = useNotifications()

      expect(notifications).toHaveProperty('success')
      expect(notifications).toHaveProperty('error')
      expect(notifications).toHaveProperty('warning')
      expect(notifications).toHaveProperty('info')
      expect(notifications).toHaveProperty('sessionExpired')
      expect(notifications).toHaveProperty('authRequired')
    })
  })
})
