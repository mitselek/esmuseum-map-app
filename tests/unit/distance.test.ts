/**
 * Tests for distance.js utilities
 *
 * Regression tests for the Infinity km bug (getLocationCoordinates)
 * and full coverage of distance calculation, parsing, and formatting.
 */
import { describe, it, expect } from 'vitest'
import {
  calculateDistance,
  parseCoordinates,
  roundCoordinates,
  formatDistance,
  sortLocationsByDistance
} from '../../app/utils/distance.js'

// ============================================================================
// calculateDistance (Haversine)
// ============================================================================

describe('calculateDistance', () => {
  it('should return 0 for identical points', () => {
    expect(calculateDistance(59.437, 24.753, 59.437, 24.753)).toBe(0)
  })

  it('should calculate Tallinn–Tartu distance (~160 km)', () => {
    // Tallinn: 59.437, 24.753 — Tartu: 58.378, 26.729
    const distance = calculateDistance(59.437, 24.753, 58.378, 26.729)
    expect(distance).toBeGreaterThan(150)
    expect(distance).toBeLessThan(170)
  })

  it('should calculate short distance accurately (< 1 km)', () => {
    // Two points ~100m apart in Tallinn
    const distance = calculateDistance(59.437, 24.753, 59.4379, 24.753)
    expect(distance).toBeGreaterThan(0.05)
    expect(distance).toBeLessThan(0.15)
  })

  it('should handle equator to pole (~10000 km)', () => {
    const distance = calculateDistance(0, 0, 90, 0)
    expect(distance).toBeGreaterThan(9900)
    expect(distance).toBeLessThan(10100)
  })

  it('should handle negative coordinates (Southern/Western hemispheres)', () => {
    const distance = calculateDistance(-33.868, 151.209, -37.813, 144.963)
    // Sydney to Melbourne ~714 km
    expect(distance).toBeGreaterThan(700)
    expect(distance).toBeLessThan(730)
  })
})

// ============================================================================
// parseCoordinates
// ============================================================================

describe('parseCoordinates', () => {
  it('should parse valid "lat,lng" string', () => {
    const result = parseCoordinates('59.437,24.753')
    expect(result).toEqual({ lat: 59.437, lng: 24.753 })
  })

  it('should handle spaces around comma', () => {
    const result = parseCoordinates('59.437 , 24.753')
    expect(result).toEqual({ lat: 59.437, lng: 24.753 })
  })

  it('should handle negative coordinates', () => {
    const result = parseCoordinates('-33.868,151.209')
    expect(result).toEqual({ lat: -33.868, lng: 151.209 })
  })

  it('should return null for empty string', () => {
    expect(parseCoordinates('')).toBeNull()
  })

  it('should return null for null/undefined', () => {
    expect(parseCoordinates(null as any)).toBeNull()

    expect(parseCoordinates(undefined as any)).toBeNull()
  })

  it('should return null for non-string input', () => {
    expect(parseCoordinates(123 as any)).toBeNull()

    expect(parseCoordinates({} as any)).toBeNull()
  })

  it('should return null for single value', () => {
    expect(parseCoordinates('59.437')).toBeNull()
  })

  it('should return null for three values', () => {
    expect(parseCoordinates('59.437,24.753,100')).toBeNull()
  })

  it('should return null for non-numeric parts', () => {
    expect(parseCoordinates('abc,def')).toBeNull()
  })

  it('should return null for out-of-range latitude (> 90)', () => {
    expect(parseCoordinates('91,24')).toBeNull()
  })

  it('should return null for out-of-range latitude (< -90)', () => {
    expect(parseCoordinates('-91,24')).toBeNull()
  })

  it('should return null for out-of-range longitude (> 180)', () => {
    expect(parseCoordinates('59,181')).toBeNull()
  })

  it('should return null for out-of-range longitude (< -180)', () => {
    expect(parseCoordinates('59,-181')).toBeNull()
  })

  it('should accept boundary values (90, 180)', () => {
    expect(parseCoordinates('90,180')).toEqual({ lat: 90, lng: 180 })
    expect(parseCoordinates('-90,-180')).toEqual({ lat: -90, lng: -180 })
  })
})

// ============================================================================
// roundCoordinates
// ============================================================================

describe('roundCoordinates', () => {
  it('should round to 6 decimal places by default', () => {
    const result = roundCoordinates(59.4370001234, 24.7530009876) as { lat: number, lng: number }
    expect(result.lat).toBe(59.437)
    expect(result.lng).toBe(24.753001)
  })

  it('should round to specified decimal places', () => {
    const result = roundCoordinates(59.4375, 24.7535, 2) as { lat: number, lng: number }
    expect(result.lat).toBe(59.44)
    expect(result.lng).toBe(24.75)
  })

  it('should handle 0 decimal places', () => {
    const result = roundCoordinates(59.7, 24.3, 0) as { lat: number, lng: number }
    expect(result.lat).toBe(60)
    expect(result.lng).toBe(24)
  })
})

// ============================================================================
// formatDistance
// ============================================================================

describe('formatDistance', () => {
  it('should return "Väga lähedal" for distance < 0.01 km (< 10m)', () => {
    expect(formatDistance(0.005)).toBe('Väga lähedal')
    expect(formatDistance(0)).toBe('Väga lähedal')
    expect(formatDistance(0.009)).toBe('Väga lähedal')
  })

  it('should format as meters for distance < 1 km', () => {
    expect(formatDistance(0.1)).toBe('100 m')
    expect(formatDistance(0.5)).toBe('500 m')
    expect(formatDistance(0.999)).toBe('999 m')
  })

  it('should format with one decimal for distance < 10 km', () => {
    expect(formatDistance(1.0)).toBe('1.0 km')
    expect(formatDistance(5.45)).toBe('5.5 km')
    expect(formatDistance(9.99)).toBe('10.0 km')
  })

  it('should format as rounded km for distance >= 10 km', () => {
    expect(formatDistance(10)).toBe('10 km')
    expect(formatDistance(159.7)).toBe('160 km')
    expect(formatDistance(1000)).toBe('1000 km')
  })
})

// ============================================================================
// getLocationCoordinates (tested via sortLocationsByDistance)
// ============================================================================

describe('getLocationCoordinates (via sortLocationsByDistance)', () => {
  const userPos = { lat: 59.437, lng: 24.753 }

  it('should extract coordinates from NormalizedLocation format', () => {
    const locations = [
      { _id: 'loc1', name: 'Place A', coordinates: { lat: 59.44, lng: 24.76 } }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    expect(sorted[0].distance).toBeGreaterThan(0)
    expect(sorted[0].distance).toBeLessThan(1) // Very close
    expect(sorted[0].distanceText).toBeDefined()
    expect(sorted[0].coordinates).toEqual({ lat: 59.44, lng: 24.76 })
  })

  it('should extract coordinates from Entu raw format (lat/long arrays)', () => {
    const locations = [
      {
        _id: 'loc2',
        name: 'Place B',
        lat: [{ number: 58.378 }],
        long: [{ number: 26.729 }]
      }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    // Tartu distance from Tallinn ~160 km
    expect(sorted[0].distance).toBeGreaterThan(150)
    expect(sorted[0].distance).toBeLessThan(170)
    expect(sorted[0].coordinates).toEqual({ lat: 58.378, lng: 26.729 })
  })

  it('should extract from Entu properties.lat/long format', () => {
    const locations = [
      {
        _id: 'loc3',
        name: 'Place C',
        properties: {
          lat: [{ number: 58.378 }],
          long: [{ number: 26.729 }]
        }
      }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    expect(sorted[0].distance).toBeGreaterThan(150)
    expect(sorted[0].distance).toBeLessThan(170)
  })

  it('should return null coordinates (Infinity distance) for location with no coordinates', () => {
    const locations = [
      { _id: 'loc-nocoords', name: 'Unknown Place' }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    expect(sorted[0].distance).toBe(Infinity)
    expect(sorted[0].distanceText).toBe('Asukoht teadmata')
    expect(sorted[0].coordinates).toBeNull()
  })

  it('should return null coordinates for location with empty lat/long arrays', () => {
    const locations = [
      { _id: 'loc-empty', name: 'Empty coords', lat: [], long: [] }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    expect(sorted[0].distance).toBe(Infinity)
    expect(sorted[0].coordinates).toBeNull()
  })

  it('should sort locations with null coordinates last', () => {
    const locations = [
      { _id: 'no-coords', name: 'Unknown' },
      { _id: 'close', name: 'Close', coordinates: { lat: 59.44, lng: 24.76 } },
      { _id: 'far', name: 'Far', coordinates: { lat: 58.378, lng: 26.729 } }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    expect(sorted[0]._id).toBe('close')
    expect(sorted[1]._id).toBe('far')
    expect(sorted[2]._id).toBe('no-coords')
    expect(sorted[2].distance).toBe(Infinity)
  })

  it('should use WeakMap cache (same object returns same result)', () => {
    const location = { _id: 'cached', coordinates: { lat: 59.44, lng: 24.76 } }
    const locations = [location]

    const sorted1 = sortLocationsByDistance(locations, userPos)
    const sorted2 = sortLocationsByDistance(locations, userPos)

    // Same distance since cached
    expect(sorted1[0].distance).toBe(sorted2[0].distance)
  })
})

// ============================================================================
// sortLocationsByDistance
// ============================================================================

describe('sortLocationsByDistance', () => {
  it('should return original array when userPosition is null', () => {
    const locations = [{ _id: 'a' }, { _id: 'b' }]

    const result = sortLocationsByDistance(locations, null as any)
    expect(result).toBe(locations) // Same reference, not sorted
  })

  it('should return original array when userPosition has no lat', () => {
    const locations = [{ _id: 'a' }]
    const result = sortLocationsByDistance(locations, { lng: 24.753 })
    expect(result).toBe(locations)
  })

  it('should return original array when userPosition has no lng', () => {
    const locations = [{ _id: 'a' }]
    const result = sortLocationsByDistance(locations, { lat: 59.437 })
    expect(result).toBe(locations)
  })

  it('should sort multiple locations by distance (nearest first)', () => {
    const userPos = { lat: 59.437, lng: 24.753 } // Tallinn
    const locations = [
      { _id: 'tartu', name: 'Tartu', coordinates: { lat: 58.378, lng: 26.729 } },
      { _id: 'kadriorg', name: 'Kadriorg', coordinates: { lat: 59.438, lng: 24.79 } },
      { _id: 'parnu', name: 'Pärnu', coordinates: { lat: 58.385, lng: 24.496 } }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    expect(sorted[0]._id).toBe('kadriorg') // Closest
    expect(sorted[1]._id).toBe('parnu') // ~117 km
    expect(sorted[2]._id).toBe('tartu') // ~160 km

    // Verify distance properties are added
    expect(sorted[0].distance).toBeGreaterThan(0)
    expect(sorted[0].distanceText).toBeDefined()
  })

  it('should handle empty locations array', () => {
    const result = sortLocationsByDistance([], { lat: 59, lng: 24 })
    expect(result).toEqual([])
  })

  it('should preserve original location properties', () => {
    const locations = [
      { _id: 'loc1', name: 'Test', customProp: 'value', coordinates: { lat: 59.44, lng: 24.76 } }
    ]

    const sorted = sortLocationsByDistance(locations, { lat: 59.437, lng: 24.753 })

    expect(sorted[0]._id).toBe('loc1')
    expect(sorted[0].name).toBe('Test')
    expect(sorted[0].customProp).toBe('value')
  })

  it('should handle mixed NormalizedLocation and Entu raw formats', () => {
    const userPos = { lat: 59.437, lng: 24.753 }
    const locations = [
      { _id: 'entu', lat: [{ number: 58.378 }], long: [{ number: 26.729 }] },
      { _id: 'normalized', coordinates: { lat: 59.438, lng: 24.79 } }
    ]

    const sorted = sortLocationsByDistance(locations, userPos)

    // Normalized (Kadriorg area) should be closer than Entu (Tartu area)
    expect(sorted[0]._id).toBe('normalized')
    expect(sorted[1]._id).toBe('entu')
  })
})
