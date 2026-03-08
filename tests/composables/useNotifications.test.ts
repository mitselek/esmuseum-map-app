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

// Mock import.meta.client
Object.defineProperty(import.meta, 'client', { value: true })

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
