import { describe, it, expect } from 'vitest'
import type { EntuEntityId } from '../../types/entu'
import { isEntuEntityId, toEntuEntityId } from '../../types/entu'

describe('EntuEntityId', () => {
  const validIds = [
    '6889db9a5d95233e69c2b490',
    '66b6245c7efc9ac06a437b97',
    '687d27c8259fc48ba59cf71a',
    '688227005d95233e69c28cf4',
    'abcdef1234567890abcdef12', // lowercase
    'ABCDEF1234567890ABCDEF12', // uppercase
    'AbCdEf1234567890aBcDeF12', // mixed case
  ]

  const invalidIds = [
    '',
    'invalid',
    '6889db9a5d95233e69c2b49', // too short (23 chars)
    '6889db9a5d95233e69c2b490x', // too long (25 chars)
    '6889db9a5d95233e69c2b49g', // invalid char 'g'
    '6889db9a5d95233e69c2b49z', // invalid char 'z'
    '6889db9a-5d95-233e-69c2-b490', // has dashes
    '6889db9a 5d95233e69c2b490', // has space
    'not-a-valid-entity-id-at-all',
  ]

  describe('isEntuEntityId', () => {
    it('should accept valid MongoDB ObjectIds', () => {
      validIds.forEach((id) => {
        expect(isEntuEntityId(id)).toBe(true)
      })
    })

    it('should reject invalid formats', () => {
      invalidIds.forEach((id) => {
        expect(isEntuEntityId(id)).toBe(false)
      })
    })

    it('should be case-insensitive', () => {
      const lowerCase = '6889db9a5d95233e69c2b490'
      const upperCase = '6889DB9A5D95233E69C2B490'
      const mixedCase = '6889Db9A5d95233E69c2B490'

      expect(isEntuEntityId(lowerCase)).toBe(true)
      expect(isEntuEntityId(upperCase)).toBe(true)
      expect(isEntuEntityId(mixedCase)).toBe(true)
    })
  })

  describe('toEntuEntityId', () => {
    it('should convert valid IDs without throwing', () => {
      validIds.forEach((id) => {
        expect(() => toEntuEntityId(id)).not.toThrow()
        const result = toEntuEntityId(id)
        expect(result).toBe(id)
      })
    })

    it('should throw on invalid IDs with descriptive message', () => {
      invalidIds.forEach((id) => {
        expect(() => toEntuEntityId(id)).toThrow(/Invalid Entu entity ID format/)
        expect(() => toEntuEntityId(id)).toThrow(/24-character hexadecimal/)
      })
    })

    it('should include invalid value in error message', () => {
      const invalidId = 'invalid-id'
      expect(() => toEntuEntityId(invalidId)).toThrow(invalidId)
    })

    it('should accept case-insensitive hex strings', () => {
      expect(() => toEntuEntityId('6889db9a5d95233e69c2b490')).not.toThrow()
      expect(() => toEntuEntityId('6889DB9A5D95233E69C2B490')).not.toThrow()
    })
  })

  describe('type narrowing with type guard', () => {
    it('should narrow type when guard returns true', () => {
      const maybeId = '6889db9a5d95233e69c2b490'

      if (isEntuEntityId(maybeId)) {
        // TypeScript should know maybeId is EntuEntityId here
        // This test verifies the type guard works at runtime
        expect(maybeId).toBe('6889db9a5d95233e69c2b490')
      }
      else {
        // Should never reach here with valid ID
        expect.fail('Type guard failed for valid ID')
      }
    })

    it('should not narrow type when guard returns false', () => {
      const notAnId = 'invalid'

      if (isEntuEntityId(notAnId)) {
        expect.fail('Type guard passed for invalid ID')
      }
      else {
        // Should reach here with invalid ID
        expect(notAnId).toBe('invalid')
      }
    })
  })

  describe('real-world usage patterns', () => {
    it('should handle IDs from production data samples', () => {
      // Real IDs from kaart.sample.json
      const realIds = [
        '6889db9a5d95233e69c2b48c', // entity._id
        '6889db9a5d95233e69c2b48e', // _type[0]._id
        '687d27c8259fc48ba59cf71a', // _type[0].reference
        '6889db9a5d95233e69c2b490', // _owner[0]._id
        '66b6245c7efc9ac06a437b97', // _owner[0].reference
      ]

      realIds.forEach((id) => {
        expect(isEntuEntityId(id)).toBe(true)
        expect(() => toEntuEntityId(id)).not.toThrow()
      })
    })
  })
})
