/**
 * Tests for server/utils/validation.ts
 *
 * Pure validation functions — mock only createError (Nuxt global) and createLogger
 */
import { describe, it, expect, vi } from 'vitest'

import {
  validateRequiredString,
  validateRequiredArray,
  validateResponseType,
  validateCoordinates,
  validateResponseItem,
  validateCreateResponseRequest,
  validateEntityId,
  validateLocationQuery,
  calculateDistance
} from '../../../server/utils/validation'

// Mock createLogger
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// Mock Nuxt's createError global
class MockH3Error extends Error {
  statusCode: number
  statusMessage: string
  constructor (opts: { statusCode: number, statusMessage: string }) {
    super(opts.statusMessage)
    this.statusCode = opts.statusCode
    this.statusMessage = opts.statusMessage
  }
}

vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  return new MockH3Error(opts)
})

describe('validation', () => {
  describe('validateRequiredString', () => {
    it('should return trimmed string for valid input', () => {
      expect(validateRequiredString('  hello  ', 'field')).toBe('hello')
    })

    it('should throw for null', () => {
      expect(() => validateRequiredString(null, 'name')).toThrow()
    })

    it('should throw for undefined', () => {
      expect(() => validateRequiredString(undefined, 'name')).toThrow()
    })

    it('should throw for empty string', () => {
      expect(() => validateRequiredString('', 'name')).toThrow()
    })

    it('should throw for whitespace-only string', () => {
      expect(() => validateRequiredString('   ', 'name')).toThrow()
    })

    it('should throw for number', () => {
      expect(() => validateRequiredString(123, 'name')).toThrow()
    })

    it('should include field name in error', () => {
      try {
        validateRequiredString('', 'myField')
      }
      catch (e: any) {
        expect(e.statusMessage).toContain('myField')
      }
    })
  })

  describe('validateRequiredArray', () => {
    it('should return array for valid input', () => {
      const arr = [1, 2, 3]
      expect(validateRequiredArray(arr, 'items')).toBe(arr)
    })

    it('should throw for null', () => {
      expect(() => validateRequiredArray(null, 'items')).toThrow()
    })

    it('should throw for empty array', () => {
      expect(() => validateRequiredArray([], 'items')).toThrow()
    })

    it('should throw for non-array', () => {
      expect(() => validateRequiredArray('not-array', 'items')).toThrow()
    })
  })

  describe('validateResponseType', () => {
    it('should accept "text"', () => {
      expect(validateResponseType('text')).toBe('text')
    })

    it('should accept "location"', () => {
      expect(validateResponseType('location')).toBe('location')
    })

    it('should accept "file"', () => {
      expect(validateResponseType('file')).toBe('file')
    })

    it('should throw for invalid type', () => {
      expect(() => validateResponseType('video')).toThrow()
    })

    it('should throw for non-string', () => {
      expect(() => validateResponseType(42)).toThrow()
    })
  })

  describe('validateCoordinates', () => {
    it('should return parsed coordinates', () => {
      expect(validateCoordinates({ lat: '59.437', lng: '24.745' }))
        .toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should accept numeric values', () => {
      expect(validateCoordinates({ lat: 59.437, lng: 24.745 }))
        .toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should throw for null', () => {
      expect(() => validateCoordinates(null)).toThrow()
    })

    it('should throw for non-object', () => {
      expect(() => validateCoordinates('coords')).toThrow()
    })

    it('should throw for NaN lat', () => {
      expect(() => validateCoordinates({ lat: 'abc', lng: '24.745' })).toThrow()
    })

    it('should throw for latitude out of range (>90)', () => {
      expect(() => validateCoordinates({ lat: 91, lng: 24 })).toThrow()
    })

    it('should throw for latitude out of range (<-90)', () => {
      expect(() => validateCoordinates({ lat: -91, lng: 24 })).toThrow()
    })

    it('should throw for longitude out of range (>180)', () => {
      expect(() => validateCoordinates({ lat: 59, lng: 181 })).toThrow()
    })

    it('should throw for longitude out of range (<-180)', () => {
      expect(() => validateCoordinates({ lat: 59, lng: -181 })).toThrow()
    })

    it('should accept boundary values', () => {
      expect(validateCoordinates({ lat: 90, lng: 180 })).toEqual({ lat: 90, lng: 180 })
      expect(validateCoordinates({ lat: -90, lng: -180 })).toEqual({ lat: -90, lng: -180 })
    })
  })

  describe('validateResponseItem', () => {
    const validItem = {
      questionId: 'q1',
      value: 'answer',
      type: 'text'
    }

    it('should validate a correct item', () => {
      const result = validateResponseItem(validItem, 0)
      expect(result.questionId).toBe('q1')
      expect(result.value).toBe('answer')
      expect(result.type).toBe('text')
    })

    it('should throw for null item', () => {
      expect(() => validateResponseItem(null, 0)).toThrow()
    })

    it('should throw for non-object', () => {
      expect(() => validateResponseItem('string', 0)).toThrow()
    })

    it('should validate item with metadata', () => {
      const item = {
        ...validItem,
        metadata: {
          fileName: 'photo.jpg',
          fileSize: '1024',
          locationId: 'loc-1'
        }
      }
      const result = validateResponseItem(item, 0)
      expect(result.metadata?.fileName).toBe('photo.jpg')
      expect(result.metadata?.fileSize).toBe(1024)
      expect(result.metadata?.locationId).toBe('loc-1')
    })

    it('should validate item with coordinates in metadata', () => {
      const item = {
        ...validItem,
        type: 'location',
        metadata: {
          coordinates: { lat: 59.437, lng: 24.745 }
        }
      }
      const result = validateResponseItem(item, 0)
      expect(result.metadata?.coordinates).toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should throw for negative fileSize', () => {
      const item = {
        ...validItem,
        metadata: { fileSize: '-5' }
      }
      expect(() => validateResponseItem(item, 0)).toThrow()
    })
  })

  describe('validateCreateResponseRequest', () => {
    const validBody = {
      taskId: 'task-123',
      responses: [{
        questionId: 'q1',
        value: 'answer',
        type: 'text'
      }]
    }

    it('should validate a correct request', () => {
      const result = validateCreateResponseRequest(validBody)
      expect(result.taskId).toBe('task-123')
      expect(result.responses).toHaveLength(1)
    })

    it('should throw for null body', () => {
      expect(() => validateCreateResponseRequest(null)).toThrow()
    })

    it('should throw for missing taskId', () => {
      expect(() => validateCreateResponseRequest({ responses: [{ questionId: 'q', value: 'v', type: 'text' }] })).toThrow()
    })

    it('should throw for missing responses', () => {
      expect(() => validateCreateResponseRequest({ taskId: 'task-1' })).toThrow()
    })

    it('should include optional respondentName', () => {
      const body = { ...validBody, respondentName: 'Student' }
      const result = validateCreateResponseRequest(body)
      expect(result.respondentName).toBe('Student')
    })
  })

  describe('validateEntityId', () => {
    it('should accept valid 24-char hex string', () => {
      expect(validateEntityId('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011')
    })

    it('should throw for empty string', () => {
      expect(() => validateEntityId('')).toThrow()
    })

    it('should throw for short string', () => {
      expect(() => validateEntityId('abc123')).toThrow()
    })

    it('should throw for non-hex characters', () => {
      expect(() => validateEntityId('507f1f77bcf86cd79943901z')).toThrow()
    })

    it('should throw for null', () => {
      expect(() => validateEntityId(null)).toThrow()
    })
  })

  describe('validateLocationQuery', () => {
    it('should return empty object for null query', () => {
      expect(validateLocationQuery(null)).toEqual({})
    })

    it('should return empty object when no lat/lng provided', () => {
      expect(validateLocationQuery({})).toEqual({})
    })

    it('should parse valid lat/lng', () => {
      expect(validateLocationQuery({ lat: '59.437', lng: '24.745' }))
        .toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should accept alternative names (latitude, longitude)', () => {
      expect(validateLocationQuery({ latitude: '59.437', longitude: '24.745' }))
        .toEqual({ lat: 59.437, lng: 24.745 })
    })

    it('should throw when only lat provided', () => {
      expect(() => validateLocationQuery({ lat: '59.437' })).toThrow()
    })

    it('should throw when only lng provided', () => {
      expect(() => validateLocationQuery({ lng: '24.745' })).toThrow()
    })

    it('should throw for NaN values', () => {
      expect(() => validateLocationQuery({ lat: 'abc', lng: 'def' })).toThrow()
    })

    it('should throw for out-of-range coordinates', () => {
      expect(() => validateLocationQuery({ lat: '91', lng: '24' })).toThrow()
    })
  })

  describe('calculateDistance', () => {
    it('should return 0 for same point', () => {
      expect(calculateDistance(59.437, 24.745, 59.437, 24.745)).toBe(0)
    })

    it('should calculate distance between Tallinn and Tartu (~164km)', () => {
      // Tallinn: 59.437, 24.745 — Tartu: 58.378, 26.729
      const distance = calculateDistance(59.437, 24.745, 58.378, 26.729)
      expect(distance).toBeGreaterThan(160000)
      expect(distance).toBeLessThan(170000)
    })

    it('should be symmetric (A→B === B→A)', () => {
      const d1 = calculateDistance(59.437, 24.745, 58.378, 26.729)
      const d2 = calculateDistance(58.378, 26.729, 59.437, 24.745)
      expect(d1).toBeCloseTo(d2, 5)
    })

    it('should handle antipodal points', () => {
      // North pole to south pole ≈ 20015 km
      const distance = calculateDistance(90, 0, -90, 0)
      expect(distance).toBeGreaterThan(20000000)
      expect(distance).toBeLessThan(20100000)
    })
  })
})
