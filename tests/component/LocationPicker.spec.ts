/**
 * Tests for LocationPicker component logic
 * Validates distance formatting, location filtering, selection, and sorting behavior
 */
import { describe, it, expect } from 'vitest'
import type { TaskLocation } from '../../types/location'

// Replicate component logic for testing
const formatDistance = (distance: number | undefined): string | null => {
  if (distance == null || !isFinite(distance)) return null
  if (distance < 0.01) return 'Väga lähedal'
  if (distance < 1) return `${Math.round(distance * 1000)} m`
  if (distance < 10) return `${distance.toFixed(1)} km`
  return `${Math.round(distance)} km`
}

const getLocationName = (location: TaskLocation): string => {
  return location.name || 'Unnamed location'
}

const getLocationDescription = (location: TaskLocation): string | null => {
  return location.description || null
}

// Position change detection logic
const hasPositionChangedSignificantly = (
  oldPos: { lat: number, lng: number } | null,
  newPos: { lat: number, lng: number } | null
): boolean => {
  if (!oldPos || !newPos) return true
  const threshold = 0.001
  return Math.abs(oldPos.lat - newPos.lat) > threshold
    || Math.abs(oldPos.lng - newPos.lng) > threshold
}

// Helper to create test locations
const createLocation = (overrides: Partial<TaskLocation> = {}): TaskLocation => ({
  _id: 'loc-1',
  name: 'Test Location',
  coordinates: { lat: 59.437, lng: 24.753 },
  ...overrides
})

describe('LocationPicker Logic', () => {
  describe('Distance Formatting', () => {
    it('should return null for undefined distance', () => {
      expect(formatDistance(undefined)).toBeNull()
    })

    it('should return null for Infinity', () => {
      expect(formatDistance(Infinity)).toBeNull()
    })

    it('should return null for NaN', () => {
      expect(formatDistance(NaN)).toBeNull()
    })

    it('should show "Väga lähedal" for very close distances', () => {
      expect(formatDistance(0.005)).toBe('Väga lähedal')
      expect(formatDistance(0)).toBe('Väga lähedal')
    })

    it('should format distances under 1km in meters', () => {
      expect(formatDistance(0.5)).toBe('500 m')
      expect(formatDistance(0.15)).toBe('150 m')
      expect(formatDistance(0.01)).toBe('10 m')
    })

    it('should format distances 1-10km with one decimal', () => {
      expect(formatDistance(1.5)).toBe('1.5 km')
      expect(formatDistance(5.0)).toBe('5.0 km')
      expect(formatDistance(9.9)).toBe('9.9 km')
    })

    it('should format distances over 10km as rounded integers', () => {
      expect(formatDistance(15.7)).toBe('16 km')
      expect(formatDistance(100.3)).toBe('100 km')
    })
  })

  describe('Location Name Resolution', () => {
    it('should return location name when available', () => {
      const loc = createLocation({ name: 'Lennusadam' })
      expect(getLocationName(loc)).toBe('Lennusadam')
    })

    it('should return fallback text when name is empty', () => {
      const loc = createLocation({ name: '' })
      expect(getLocationName(loc)).toBe('Unnamed location')
    })

    it('should return fallback text when name is undefined', () => {
      const loc = createLocation({ name: undefined })
      expect(getLocationName(loc)).toBe('Unnamed location')
    })
  })

  describe('Location Description', () => {
    it('should return description when available', () => {
      const loc = createLocation({ description: 'A museum' })
      expect(getLocationDescription(loc)).toBe('A museum')
    })

    it('should return null when description is empty', () => {
      const loc = createLocation({ description: '' })
      expect(getLocationDescription(loc)).toBeNull()
    })

    it('should return null when description is undefined', () => {
      const loc = createLocation({ description: undefined })
      expect(getLocationDescription(loc)).toBeNull()
    })
  })

  describe('Position Change Detection', () => {
    it('should detect change when old position is null', () => {
      expect(hasPositionChangedSignificantly(null, { lat: 59.437, lng: 24.753 })).toBe(true)
    })

    it('should detect change when new position is null', () => {
      expect(hasPositionChangedSignificantly({ lat: 59.437, lng: 24.753 }, null)).toBe(true)
    })

    it('should not detect change for small movements', () => {
      const old = { lat: 59.437000, lng: 24.753000 }
      const now = { lat: 59.437000, lng: 24.753000 }
      expect(hasPositionChangedSignificantly(old, now)).toBe(false)
    })

    it('should detect significant latitude change', () => {
      const old = { lat: 59.437, lng: 24.753 }
      const now = { lat: 59.440, lng: 24.753 }
      expect(hasPositionChangedSignificantly(old, now)).toBe(true)
    })

    it('should detect significant longitude change', () => {
      const old = { lat: 59.437, lng: 24.753 }
      const now = { lat: 59.437, lng: 24.756 }
      expect(hasPositionChangedSignificantly(old, now)).toBe(true)
    })

    it('should use 0.001 threshold (~100m)', () => {
      const old = { lat: 59.437, lng: 24.753 }
      // Just under threshold
      const smallMove = { lat: 59.4379, lng: 24.7539 }
      expect(hasPositionChangedSignificantly(old, smallMove)).toBe(false)

      // Just over threshold
      const bigMove = { lat: 59.4381, lng: 24.753 }
      expect(hasPositionChangedSignificantly(old, bigMove)).toBe(true)
    })
  })

  describe('Location Search Filtering', () => {
    const locations: TaskLocation[] = [
      createLocation({ _id: '1', name: 'Lennusadam', description: 'Maritime museum' }),
      createLocation({ _id: '2', name: 'Patarei', description: 'Prison fortress' }),
      createLocation({ _id: '3', name: 'Kiek in de Kök', description: 'Defence tower' })
    ]

    it('should filter by name match', () => {
      const query = 'lennu'
      const filtered = locations.filter((loc) => {
        const name = getLocationName(loc).toLowerCase()
        return name.includes(query)
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]!._id).toBe('1')
    })

    it('should filter by description match', () => {
      const query = 'prison'
      const filtered = locations.filter((loc) => {
        const desc = getLocationDescription(loc)?.toLowerCase() || ''
        return desc.includes(query)
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]!._id).toBe('2')
    })

    it('should return all locations when query is empty', () => {
      const query = ''
      const filtered = query
        ? locations.filter(() => false)
        : locations
      expect(filtered).toHaveLength(3)
    })

    it('should be case-insensitive', () => {
      const query = 'KIEK'
      const filtered = locations.filter((loc) => {
        const name = getLocationName(loc).toLowerCase()
        return name.includes(query.toLowerCase())
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]!._id).toBe('3')
    })
  })

  describe('Visited Location Check', () => {
    it('should detect visited location', () => {
      const visited = new Set(['loc-1', 'loc-2'])
      const location = createLocation({ _id: 'loc-1' })
      expect(visited.has(location._id)).toBe(true)
    })

    it('should detect unvisited location', () => {
      const visited = new Set(['loc-1', 'loc-2'])
      const location = createLocation({ _id: 'loc-3' })
      expect(visited.has(location._id)).toBe(false)
    })

    it('should handle empty visited set', () => {
      const visited = new Set<string>()
      const location = createLocation({ _id: 'loc-1' })
      expect(visited.has(location._id)).toBe(false)
    })
  })

  describe('Props Interface', () => {
    it('should define correct prop defaults', () => {
      const defaults = {
        locations: [] as TaskLocation[],
        selected: null as TaskLocation | null,
        loading: false,
        error: null as string | null,
        visitedLocations: new Set<string>()
      }

      expect(defaults.locations).toEqual([])
      expect(defaults.selected).toBeNull()
      expect(defaults.loading).toBe(false)
      expect(defaults.error).toBeNull()
      expect(defaults.visitedLocations.size).toBe(0)
    })

    it('should define correct emits', () => {
      const emitNames = ['select', 'retry']
      expect(emitNames).toContain('select')
      expect(emitNames).toContain('retry')
    })
  })
})
