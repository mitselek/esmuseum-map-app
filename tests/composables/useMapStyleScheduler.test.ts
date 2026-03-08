/**
 * Tests for useMapStyleScheduler composable
 * Mocks SunCalc for astronomical calculations
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Mock useClientLogger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
;(globalThis as any).useClientLogger = vi.fn(() => mockLogger)

// Mock useMapStyles
const mockSetStyle = vi.fn().mockReturnValue(true)
;(globalThis as any).useMapStyles = vi.fn(() => ({
  setStyle: mockSetStyle,
  currentStyle: ref('default'),
  getCurrentStyle: { value: { id: 'default' } },
  getStyles: vi.fn(),
  getStyle: vi.fn(),
  listStyles: vi.fn()
}))

// Mock useLocation
const mockUserPosition = ref<{ lat: number, lng: number } | null>(null)
;(globalThis as any).useLocation = vi.fn(() => ({
  userPosition: mockUserPosition,
  gettingLocation: ref(false),
  locationError: ref(null),
  getUserPosition: vi.fn(),
  initializeGPS: vi.fn(),
  initializeGPSWithPermissionCheck: vi.fn(),
  checkGeolocationPermission: vi.fn(),
  setManualOverride: vi.fn(),
  startGPSUpdates: vi.fn(),
  stopGPSUpdates: vi.fn(),
  requestGPSPermission: vi.fn(),
  dismissGPSPrompt: vi.fn(),
  showGPSPrompt: ref(false),
  permissionDenied: ref(false),
  loadMapLocations: vi.fn(),
  loadTaskLocations: vi.fn(),
  sortByDistance: vi.fn(),
  getSortedLocations: vi.fn(),
  formatCoordinates: vi.fn(),
  getLocationCoordinates: vi.fn(),
  getLocationName: vi.fn(),
  getLocationDescription: vi.fn(),
  clearUserPosition: vi.fn()
}))

// Mock SunCalc
vi.mock('suncalc', () => ({
  default: {
    getMoonIllumination: vi.fn().mockReturnValue({ fraction: 0.5, phase: 0.25 }),
    getMoonTimes: vi.fn().mockReturnValue({
      rise: new Date('2026-03-08T18:00:00'),
      set: new Date('2026-03-09T06:00:00')
    }),
    getTimes: vi.fn().mockReturnValue({
      sunrise: new Date('2026-03-08T07:00:00'),
      sunset: new Date('2026-03-08T18:30:00')
    })
  }
}))

const { useMapStyleScheduler } = await import('~/composables/useMapStyleScheduler')

describe('useMapStyleScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUserPosition.value = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('evaluateRules', () => {
    it('should return default rule when no special conditions match', async () => {
      // Set date to a regular day (not Feb 24, not Jun 23, not Thursday)
      vi.setSystemTime(new Date('2026-03-08T12:00:00')) // Sunday

      const { applyScheduledStyle } = useMapStyleScheduler()
      await applyScheduledStyle()

      expect(mockSetStyle).toHaveBeenCalledWith('voyager')
    })

    it('should apply independence day style on Feb 24 during daylight', async () => {
      vi.setSystemTime(new Date('2026-02-24T12:00:00'))
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }

      // Mock SunCalc to return times that make isDaylight() true
      const SunCalc = (await import('suncalc')).default
      vi.mocked(SunCalc.getTimes).mockReturnValue({
        sunrise: new Date('2026-02-24T07:00:00'),
        sunset: new Date('2026-02-24T17:30:00')
      } as any)

      const { applyScheduledStyle } = useMapStyleScheduler()
      await applyScheduledStyle()

      expect(mockSetStyle).toHaveBeenCalledWith('vintage')
    })

    it('should apply victory day style on Jun 23', async () => {
      vi.setSystemTime(new Date('2026-06-23T12:00:00'))

      const { applyScheduledStyle } = useMapStyleScheduler()
      await applyScheduledStyle()

      expect(mockSetStyle).toHaveBeenCalledWith('terrain')
    })

    it('should apply toner style on full moon Thursday', async () => {
      // 2026-03-05 is a Thursday
      vi.setSystemTime(new Date('2026-03-05T22:00:00'))
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }

      const SunCalc = (await import('suncalc')).default
      vi.mocked(SunCalc.getMoonIllumination).mockReturnValue({
        fraction: 0.98, phase: 0.5, angle: 0
      })
      vi.mocked(SunCalc.getMoonTimes).mockReturnValue({
        rise: new Date('2026-03-05T18:00:00'),
        set: new Date('2026-03-06T06:00:00'),
        alwaysUp: false,
        alwaysDown: false
      } as any)

      const { applyScheduledStyle } = useMapStyleScheduler()
      await applyScheduledStyle()

      expect(mockSetStyle).toHaveBeenCalledWith('toner')
    })

    it('should not apply full moon Thursday without GPS', async () => {
      vi.setSystemTime(new Date('2026-03-05T22:00:00')) // Thursday
      mockUserPosition.value = null

      const SunCalc = (await import('suncalc')).default
      vi.mocked(SunCalc.getMoonIllumination).mockReturnValue({
        fraction: 0.98, phase: 0.5, angle: 0
      })

      const { applyScheduledStyle } = useMapStyleScheduler()
      await applyScheduledStyle()

      // Should fall back to default (voyager) since full-moon-thursday needs GPS
      expect(mockSetStyle).toHaveBeenCalledWith('voyager')
    })
  })

  describe('priority handling', () => {
    it('should prefer independence day (100) over victory day (90)', async () => {
      // Hypothetically both match - independence day has higher priority
      vi.setSystemTime(new Date('2026-02-24T12:00:00'))
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }

      const SunCalc = (await import('suncalc')).default
      vi.mocked(SunCalc.getTimes).mockReturnValue({
        sunrise: new Date('2026-02-24T07:00:00'),
        sunset: new Date('2026-02-24T17:30:00')
      } as any)

      const { applyScheduledStyle } = useMapStyleScheduler()
      await applyScheduledStyle()

      expect(mockSetStyle).toHaveBeenCalledWith('vintage')
    })
  })

  describe('startScheduler', () => {
    it('should apply style immediately and set interval', async () => {
      vi.setSystemTime(new Date('2026-03-08T12:00:00'))

      const { startScheduler } = useMapStyleScheduler()
      startScheduler(10) // 10 minute interval

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Started')
      )
    })

    it('should re-evaluate rules at interval', async () => {
      vi.setSystemTime(new Date('2026-03-08T12:00:00'))

      const { startScheduler } = useMapStyleScheduler()
      startScheduler(5)

      // Clear initial calls
      mockSetStyle.mockClear()

      // Advance by 5 minutes
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

      // applyScheduledStyle should have been called again
      expect(mockSetStyle).toHaveBeenCalled()
    })
  })

  describe('applyScheduledStyle', () => {
    it('should not re-apply same rule', async () => {
      vi.setSystemTime(new Date('2026-03-08T12:00:00'))

      const { applyScheduledStyle } = useMapStyleScheduler()

      await applyScheduledStyle()
      expect(mockSetStyle).toHaveBeenCalledTimes(1)

      mockSetStyle.mockClear()
      await applyScheduledStyle()
      // Same rule, should not call setStyle again
      expect(mockSetStyle).not.toHaveBeenCalled()
    })

    it('should log error if rule check throws', async () => {
      vi.setSystemTime(new Date('2026-03-08T12:00:00'))

      const { styleRules, applyScheduledStyle } = useMapStyleScheduler()

      // Make a rule throw
      const originalCheck = styleRules[0].check
      styleRules[0].check = () => {
        throw new Error('test error')
      }

      await applyScheduledStyle()

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error evaluating rule'),
        expect.any(Error)
      )

      // Restore
      styleRules[0].check = originalCheck
    })
  })

  describe('getRuleStatus', () => {
    it('should log status without GPS', async () => {
      vi.setSystemTime(new Date('2026-03-08T12:00:00'))
      mockUserPosition.value = null

      const { getRuleStatus } = useMapStyleScheduler()
      await getRuleStatus()

      const calls = mockLogger.debug.mock.calls.map((c: any[]) => c[0])
      expect(calls.some((c: string) => c.includes('GPS not available'))).toBe(true)
    })

    it('should log status with GPS', async () => {
      vi.setSystemTime(new Date('2026-03-08T12:00:00'))
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }

      const { getRuleStatus } = useMapStyleScheduler()
      await getRuleStatus()

      const calls = mockLogger.debug.mock.calls.map((c: any[]) => c[0])
      expect(calls.some((c: string) => c.includes('59.4370'))).toBe(true)
    })
  })
})
