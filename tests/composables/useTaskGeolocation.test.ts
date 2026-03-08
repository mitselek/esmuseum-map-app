/**
 * Tests for useTaskGeolocation composable
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'

// Mock useClientLogger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
;(globalThis as any).useClientLogger = vi.fn(() => mockLogger)

// Mock useLocation
const mockUserPosition = ref<{ lat: number, lng: number, accuracy?: number } | null>(null)
const mockGettingLocation = ref(false)
const mockLocationError = ref<string | null>(null)
const mockSortByDistance = vi.fn((locations: any[], _pos: any) => locations)

;(globalThis as any).useLocation = vi.fn(() => ({
  userPosition: mockUserPosition,
  gettingLocation: mockGettingLocation,
  locationError: mockLocationError,
  sortByDistance: mockSortByDistance,
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
  getSortedLocations: vi.fn(),
  formatCoordinates: vi.fn(),
  getLocationCoordinates: vi.fn(),
  getLocationName: vi.fn(),
  getLocationDescription: vi.fn(),
  clearUserPosition: vi.fn()
}))

const { useTaskGeolocation } = await import('~/composables/useTaskGeolocation')

describe('useTaskGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserPosition.value = null
    mockGettingLocation.value = false
    mockLocationError.value = null
  })

  describe('initialization', () => {
    it('should return expected properties', () => {
      const result = useTaskGeolocation()
      expect(result).toHaveProperty('geolocationLoading')
      expect(result).toHaveProperty('geolocationError')
      expect(result).toHaveProperty('userLocation')
      expect(result).toHaveProperty('onRequestLocation')
      expect(result).toHaveProperty('setFormLocation')
      expect(result).toHaveProperty('watchPosition')
    })
  })

  describe('computed state wrappers', () => {
    it('should reflect geolocationLoading from useLocation', () => {
      const { geolocationLoading } = useTaskGeolocation()
      expect(geolocationLoading.value).toBe(false)
      mockGettingLocation.value = true
      expect(geolocationLoading.value).toBe(true)
    })

    it('should reflect geolocationError from useLocation', () => {
      const { geolocationError } = useTaskGeolocation()
      expect(geolocationError.value).toBeNull()
      mockLocationError.value = 'GPS timeout'
      expect(geolocationError.value).toBe('GPS timeout')
    })

    it('should reflect userLocation from useLocation', () => {
      const { userLocation } = useTaskGeolocation()
      expect(userLocation.value).toBeNull()
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }
      expect(userLocation.value).toEqual({ lat: 59.437, lng: 24.745 })
    })
  })

  describe('onRequestLocation', () => {
    it('should sort locations when user position available', () => {
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }
      const taskLocations = ref([
        { _id: '1', name: 'A', coordinates: { lat: 59.44, lng: 24.75 } },
        { _id: '2', name: 'B', coordinates: { lat: 59.45, lng: 24.76 } }
      ])

      const { onRequestLocation } = useTaskGeolocation()
      onRequestLocation(taskLocations as any)

      expect(mockSortByDistance).toHaveBeenCalled()
    })

    it('should not sort when no user position', () => {
      mockUserPosition.value = null
      const taskLocations = ref([
        { _id: '1', name: 'A', coordinates: { lat: 59.44, lng: 24.75 } }
      ])

      const { onRequestLocation } = useTaskGeolocation()
      onRequestLocation(taskLocations as any)

      expect(mockSortByDistance).not.toHaveBeenCalled()
    })

    it('should not sort when locations empty', () => {
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }
      const taskLocations = ref([])

      const { onRequestLocation } = useTaskGeolocation()
      onRequestLocation(taskLocations as any)

      expect(mockSortByDistance).not.toHaveBeenCalled()
    })

    it('should log error on exception', () => {
      mockUserPosition.value = { lat: 59.437, lng: 24.745 }
      mockSortByDistance.mockImplementationOnce(() => {
        throw new Error('sort failed')
      })

      const taskLocations = ref([
        { _id: '1', name: 'A', coordinates: { lat: 59.44, lng: 24.75 } }
      ])

      const { onRequestLocation } = useTaskGeolocation()
      onRequestLocation(taskLocations as any)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in location request:',
        expect.any(Error)
      )
    })
  })

  describe('setFormLocation', () => {
    it('should set location from string coordinates', () => {
      const mockSetLocation = vi.fn()
      const responseFormRef = ref({ setLocation: mockSetLocation })

      const { setFormLocation } = useTaskGeolocation()
      setFormLocation(responseFormRef as any, '59.437,24.745')

      expect(mockSetLocation).toHaveBeenCalledWith('59.437,24.745')
    })

    it('should set location from coordinate object', () => {
      const mockSetLocation = vi.fn()
      const responseFormRef = ref({ setLocation: mockSetLocation })

      const { setFormLocation } = useTaskGeolocation()
      setFormLocation(responseFormRef as any, { latitude: 59.437, longitude: 24.745 })

      expect(mockSetLocation).toHaveBeenCalledWith('59.437000,24.745000')
    })

    it('should not set location when form ref is null', () => {
      const responseFormRef = ref(null)

      const { setFormLocation } = useTaskGeolocation()
      // Should not throw
      setFormLocation(responseFormRef as any, '59.437,24.745')
    })

    it('should not set location when coordinates are empty', () => {
      const mockSetLocation = vi.fn()
      const responseFormRef = ref({ setLocation: mockSetLocation })

      const { setFormLocation } = useTaskGeolocation()
      setFormLocation(responseFormRef as any, '' as any)

      expect(mockSetLocation).not.toHaveBeenCalled()
    })
  })

  describe('watchPosition', () => {
    it('should accept watcher setup without error', () => {
      const userPos = computed(() => mockUserPosition.value)
      const taskLocations = ref([])
      const sortFn = vi.fn()

      const { watchPosition } = useTaskGeolocation()
      // Should not throw
      watchPosition(userPos as any, taskLocations as any, sortFn)
    })
  })
})
