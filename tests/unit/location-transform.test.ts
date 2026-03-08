/**
 * Tests for app/utils/location-transform.ts
 *
 * Pure functions: extractCoordinates, normalizeLocation, normalizeLocations
 */
import { describe, it, expect } from 'vitest'
import type { EntuLocation, EntuEntityId } from '../../types/entu'

import {
  extractCoordinates,
  normalizeLocation,
  normalizeLocations
} from '../../app/utils/location-transform'

// Helper to build a minimal EntuLocation
function makeEntuLocation (overrides: Partial<EntuLocation> = {}): EntuLocation {
  return {
    _id: 'loc-1' as EntuEntityId,
    _type: [{ string: 'asukoht', reference: '', entity_type: '' }],
    name: [{ string: 'Test Location' }],
    ...overrides
  } as EntuLocation
}

describe('location-transform', () => {
  describe('extractCoordinates', () => {
    it('should extract lat/lng from Entu location', () => {
      const entity = makeEntuLocation({
        lat: [{ number: 59.437 }],
        long: [{ number: 24.745 }]
      } as Partial<EntuLocation>)

      const coords = extractCoordinates(entity)
      expect(coords!.lat).toBe(59.437)
      expect(coords!.lng).toBe(24.745)
    })

    it('should return null when lat/lng missing', () => {
      const entity = makeEntuLocation()
      const coords = extractCoordinates(entity)
      expect(coords).toBeNull()
    })

    it('should return null when lat array is empty', () => {
      const entity = makeEntuLocation({
        lat: [],
        long: [{ number: 24.745 }]
      } as Partial<EntuLocation>)
      const coords = extractCoordinates(entity)
      expect(coords).toBeNull()
    })

    it('should handle zero coordinates (valid equator/meridian)', () => {
      const entity = makeEntuLocation({
        lat: [{ number: 0 }],
        long: [{ number: 0 }]
      } as Partial<EntuLocation>)
      const coords = extractCoordinates(entity)
      expect(coords).toEqual({ lat: 0, lng: 0 })
    })
  })

  describe('normalizeLocation', () => {
    it('should normalize a full Entu location entity', () => {
      const entity = makeEntuLocation({
        lat: [{ number: 59.437 }],
        long: [{ number: 24.745 }],
        kirjeldus: [{ string: 'A nice place' }]
      } as Partial<EntuLocation>)

      const normalized = normalizeLocation(entity)
      expect(normalized._id).toBe('loc-1')
      expect(normalized.name).toBe('Test Location')
      expect(normalized.description).toBe('A nice place')
      expect(normalized.coordinates).toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should handle missing name', () => {
      const entity = makeEntuLocation({ name: [] } as Partial<EntuLocation>)
      const normalized = normalizeLocation(entity)
      expect(normalized.name).toBeUndefined()
    })

    it('should handle missing description', () => {
      const entity = makeEntuLocation()
      const normalized = normalizeLocation(entity)
      expect(normalized.description).toBeUndefined()
    })

    it('should return null coordinates when missing', () => {
      const entity = makeEntuLocation()
      const normalized = normalizeLocation(entity)
      expect(normalized.coordinates).toBeNull()
    })
  })

  describe('normalizeLocations', () => {
    it('should normalize an array of entities', () => {
      const entities = [
        makeEntuLocation({
          _id: 'loc-1' as EntuEntityId,
          lat: [{ number: 59.437 }],
          long: [{ number: 24.745 }]
        } as Partial<EntuLocation>),
        makeEntuLocation({
          _id: 'loc-2' as EntuEntityId,
          name: [{ string: 'Museum' }],
          lat: [{ number: 58.378 }],
          long: [{ number: 26.729 }]
        } as Partial<EntuLocation>)
      ]

      const result = normalizeLocations(entities)
      expect(result).toHaveLength(2)
      expect(result[0]!._id).toBe('loc-1')
      expect(result[1]!.name).toBe('Museum')
    })

    it('should return empty array for empty input', () => {
      expect(normalizeLocations([])).toEqual([])
    })
  })
})
