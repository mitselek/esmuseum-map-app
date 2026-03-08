/**
 * Tests for useLocation composable
 * Focuses on pure utility functions and permission state management
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useClientLogger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
;(globalThis as any).useClientLogger = vi.fn(() => mockLogger)

// Mock useI18n
;(globalThis as any).useI18n = vi.fn(() => ({
  t: (key: string) => key
}))

// Mock useEntuApi
const mockSearchEntities = vi.fn()
;(globalThis as any).useEntuApi = vi.fn(() => ({
  searchEntities: mockSearchEntities
}))

// Mock navigator.geolocation
const mockGetCurrentPosition = vi.fn()
const mockPermissionsQuery = vi.fn()

// Mock ~/utils/distance
vi.mock('~/utils/distance', () => ({
  getCurrentPosition: vi.fn(),
  sortLocationsByDistance: vi.fn((locations: any[], _pos: any) => locations)
}))

// Mock ~/utils/location-transform
vi.mock('~/utils/location-transform', () => ({
  normalizeLocations: vi.fn((entities: any[]) => entities.map((e: any) => ({
    _id: e._id,
    name: e.name?.[0]?.string,
    description: e.kirjeldus?.[0]?.string,
    coordinates: {
      lat: e.lat?.[0]?.number ?? 0,
      lng: e.long?.[0]?.number ?? 0
    }
  })))
}))

// Mock ~/constants/entu
vi.mock('~/constants/entu', () => ({
  ENTU_TYPES: { LOCATION: 'asukoht' },
  ENTU_PROPERTIES: {
    TYPE_STRING: '_type.string',
    NAME_STRING: 'nimi.string',
    LAT_NUMBER: 'lat.number',
    LONG_NUMBER: 'long.number',
    KIRJELDUS_STRING: 'kirjeldus.string'
  }
}))

// Setup navigator mocks
beforeEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      geolocation: {
        getCurrentPosition: mockGetCurrentPosition,
        watchPosition: vi.fn()
      },
      permissions: {
        query: mockPermissionsQuery
      },
      userAgent: 'Mozilla/5.0 (Linux; Android 12)',
      vibrate: vi.fn()
    },
    writable: true,
    configurable: true
  })
})

// We need to dynamically import to pick up mocks.
// Since useLocation uses singleton state, we must reset between tests.
let useLocation: any

// Re-import for each test to reset singleton state
beforeEach(async () => {
  vi.clearAllMocks()
  // Reset module to clear singleton state
  vi.resetModules()
  // Re-setup globals that get cleared by resetModules
  ;(globalThis as any).useClientLogger = vi.fn(() => mockLogger)
  ;(globalThis as any).useI18n = vi.fn(() => ({ t: (key: string) => key }))
  ;(globalThis as any).useEntuApi = vi.fn(() => ({ searchEntities: mockSearchEntities }))

  const mod = await import('~/composables/useLocation')
  useLocation = mod.useLocation
})

describe('useLocation', () => {
  describe('initialization', () => {
    it('should return all expected properties', () => {
      const location = useLocation()
      expect(location).toHaveProperty('userPosition')
      expect(location).toHaveProperty('gettingLocation')
      expect(location).toHaveProperty('locationError')
      expect(location).toHaveProperty('showGPSPrompt')
      expect(location).toHaveProperty('permissionDenied')
      expect(location).toHaveProperty('getUserPosition')
      expect(location).toHaveProperty('formatCoordinates')
      expect(location).toHaveProperty('getLocationName')
      expect(location).toHaveProperty('loadMapLocations')
    })

    it('should start with null position', () => {
      const { userPosition } = useLocation()
      expect(userPosition.value).toBeNull()
    })

    it('should start not loading', () => {
      const { gettingLocation } = useLocation()
      expect(gettingLocation.value).toBe(false)
    })
  })

  describe('formatCoordinates', () => {
    it('should format coordinate string', () => {
      const { formatCoordinates } = useLocation()
      expect(formatCoordinates('59.4370, 24.7450')).toBe('59.4370, 24.7450')
    })

    it('should format coordinate object', () => {
      const { formatCoordinates } = useLocation()
      expect(formatCoordinates({ lat: 59.437, lng: 24.745 })).toBe('59.4370, 24.7450')
    })

    it('should return empty string for null', () => {
      const { formatCoordinates } = useLocation()
      expect(formatCoordinates(null)).toBe('')
    })

    it('should return empty string for invalid string', () => {
      const { formatCoordinates } = useLocation()
      expect(formatCoordinates('invalid')).toBe('')
    })

    it('should handle string with extra whitespace', () => {
      const { formatCoordinates } = useLocation()
      expect(formatCoordinates('59.437 , 24.745')).toBe('59.4370, 24.7450')
    })
  })

  describe('getLocationName', () => {
    it('should return string name directly', () => {
      const { getLocationName } = useLocation()
      expect(getLocationName({ name: 'Museum' })).toBe('Museum')
    })

    it('should return nimi field', () => {
      const { getLocationName } = useLocation()
      expect(getLocationName({ nimi: 'Muuseum' })).toBe('Muuseum')
    })

    it('should extract from Entu array format', () => {
      const { getLocationName } = useLocation()
      expect(getLocationName({ name: [{ string: 'Museum' }] })).toBe('Museum')
    })

    it('should extract from properties.name', () => {
      const { getLocationName } = useLocation()
      expect(getLocationName({
        properties: { name: [{ value: 'Museum' }] }
      })).toBe('Museum')
    })

    it('should extract from properties.nimi', () => {
      const { getLocationName } = useLocation()
      expect(getLocationName({
        properties: { nimi: [{ value: 'Muuseum' }] }
      })).toBe('Muuseum')
    })

    it('should return default for missing name', () => {
      const { getLocationName } = useLocation()
      expect(getLocationName({})).toBe('Nimetu asukoht')
    })
  })

  describe('getLocationDescription', () => {
    it('should return string description directly', () => {
      const { getLocationDescription } = useLocation()
      expect(getLocationDescription({ description: 'A nice place' })).toBe('A nice place')
    })

    it('should extract from Entu kirjeldus array', () => {
      const { getLocationDescription } = useLocation()
      expect(getLocationDescription({
        kirjeldus: [{ string: 'Ilus koht' }]
      })).toBe('Ilus koht')
    })

    it('should return string kirjeldus directly', () => {
      const { getLocationDescription } = useLocation()
      expect(getLocationDescription({ kirjeldus: 'Ilus koht' })).toBe('Ilus koht')
    })

    it('should return null for missing description', () => {
      const { getLocationDescription } = useLocation()
      expect(getLocationDescription({})).toBeNull()
    })
  })

  describe('getLocationCoordinates', () => {
    it('should return coordinates from pre-calculated field', () => {
      const { getLocationCoordinates } = useLocation()
      expect(getLocationCoordinates({
        coordinates: { lat: 59.437, lng: 24.745 }
      })).toBe('59.437,24.745')
    })

    it('should extract from Entu lat/long arrays', () => {
      const { getLocationCoordinates } = useLocation()
      expect(getLocationCoordinates({
        lat: [{ number: 59.437 }],
        long: [{ number: 24.745 }]
      })).toBe('59.437,24.745')
    })

    it('should extract from properties', () => {
      const { getLocationCoordinates } = useLocation()
      expect(getLocationCoordinates({
        properties: {
          lat: [{ value: 59.437, number: 59.437, string: '59.437' }],
          long: [{ value: 24.745, number: 24.745, string: '24.745' }]
        }
      })).toBe('59.437,24.745')
    })

    it('should return empty string for null location', () => {
      const { getLocationCoordinates } = useLocation()
      expect(getLocationCoordinates(null as any)).toBe('')
    })

    it('should return empty string for location without coordinates', () => {
      const { getLocationCoordinates } = useLocation()
      expect(getLocationCoordinates({})).toBe('')
    })
  })

  describe('loadMapLocations', () => {
    it('should throw for empty map ID', async () => {
      const { loadMapLocations } = useLocation()
      await expect(loadMapLocations('')).rejects.toThrow('Map ID is required')
    })

    it('should throw for invalid map ID format', async () => {
      const { loadMapLocations } = useLocation()
      await expect(loadMapLocations('invalid')).rejects.toThrow('Invalid map ID format')
    })

    it('should load and normalize locations', async () => {
      const mockLocations = [
        {
          _id: 'loc1',
          name: [{ string: 'Museum' }],
          lat: [{ number: 59.437 }],
          long: [{ number: 24.745 }],
          kirjeldus: [{ string: 'Nice place' }]
        }
      ]
      mockSearchEntities.mockResolvedValue({
        entities: mockLocations,
        count: 1
      })

      const { loadMapLocations } = useLocation()
      const result = await loadMapLocations('507f1f77bcf86cd799439011')

      expect(mockSearchEntities).toHaveBeenCalledWith(expect.objectContaining({
        '_parent.reference': '507f1f77bcf86cd799439011'
      }))
      expect(result).toHaveLength(1)
    })

    it('should throw user-friendly error on API failure', async () => {
      mockSearchEntities.mockRejectedValue(new Error('Network error'))

      const { loadMapLocations } = useLocation()
      await expect(loadMapLocations('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Asukohtade laadimine ebaõnnestus')
    })
  })

  describe('loadTaskLocations', () => {
    it('should return empty array for task without map', async () => {
      const { loadTaskLocations } = useLocation()
      const result = await loadTaskLocations({})
      expect(result).toEqual([])
    })

    it('should throw for null task', async () => {
      const { loadTaskLocations } = useLocation()
      await expect(loadTaskLocations(null as any)).rejects.toThrow('Task is required')
    })

    it('should extract map reference from Entu array', async () => {
      mockSearchEntities.mockResolvedValue({ entities: [], count: 0 })

      const { loadTaskLocations } = useLocation()
      await loadTaskLocations({
        kaart: [{ reference: '507f1f77bcf86cd799439011' }]
      })

      expect(mockSearchEntities).toHaveBeenCalledWith(expect.objectContaining({
        '_parent.reference': '507f1f77bcf86cd799439011'
      }))
    })

    it('should extract map reference from string', async () => {
      mockSearchEntities.mockResolvedValue({ entities: [], count: 0 })

      const { loadTaskLocations } = useLocation()
      await loadTaskLocations({
        kaart: '507f1f77bcf86cd799439011'
      })

      expect(mockSearchEntities).toHaveBeenCalled()
    })
  })

  describe('clearUserPosition', () => {
    it('should reset all location state', () => {
      const location = useLocation()
      location.userPosition.value = { lat: 59.437, lng: 24.745 }
      location.locationError.value = 'some error'

      location.clearUserPosition()

      expect(location.userPosition.value).toBeNull()
      expect(location.locationError.value).toBeNull()
    })
  })

  describe('permission state management', () => {
    it('should set permissionDenied on dismiss', () => {
      const { dismissGPSPrompt, showGPSPrompt, permissionDenied } = useLocation()
      showGPSPrompt.value = true

      dismissGPSPrompt()

      expect(showGPSPrompt.value).toBe(false)
      expect(permissionDenied.value).toBe(true)
    })

    it('should handle checkGeolocationPermission when permissions API unavailable', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          ...navigator,
          permissions: undefined,
          geolocation: { getCurrentPosition: vi.fn() }
        },
        writable: true,
        configurable: true
      })

      const { checkGeolocationPermission } = useLocation()
      const result = await checkGeolocationPermission()
      expect(result).toBe('unknown')
    })

    it('should return granted when permission is granted', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'granted' })

      const { checkGeolocationPermission } = useLocation()
      const result = await checkGeolocationPermission()
      expect(result).toBe('granted')
    })

    it('should return denied when permission is denied', async () => {
      mockPermissionsQuery.mockResolvedValue({ state: 'denied' })

      const { checkGeolocationPermission } = useLocation()
      const result = await checkGeolocationPermission()
      expect(result).toBe('denied')
    })
  })

  describe('setManualOverride', () => {
    it('should set manual override flag', () => {
      const location = useLocation()
      location.setManualOverride(true)
      // Manual override pauses GPS updates - we verify it doesn't crash
      location.setManualOverride(false)
    })
  })

  describe('sortByDistance', () => {
    it('should return locations unsorted when no GPS position', () => {
      const { sortByDistance } = useLocation()
      const locations = [{ name: 'A' }, { name: 'B' }]
      const result = sortByDistance(locations as any)
      expect(result).toEqual(locations)
    })
  })
})
