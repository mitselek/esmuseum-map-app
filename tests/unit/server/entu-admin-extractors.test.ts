/**
 * Tests for extractGroupsFromPerson and extractGroupFromTask
 * from server/utils/entu-admin.ts
 *
 * Pure functions that operate on EntuEntity objects — no API calls
 */
import { describe, it, expect, vi } from 'vitest'

import type { EntuEntity, EntuEntityId } from '../../../types/entu'

import {
  extractGroupsFromPerson,
  extractGroupFromTask
} from '../../../server/utils/entu-admin'

// Mock createLogger
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// Mock createError (Nuxt global, used by getAdminApiConfig)
vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  return new Error(opts.statusMessage)
})

// Mock useRuntimeConfig (Nuxt global, used by getAdminApiConfig)
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    entuUrl: 'https://api.entu.app',
    entuAccount: 'esmuuseum'
  }
}))

// Mock the entu API module (imported by entu-admin)
vi.mock('../../../server/utils/entu', () => ({
  callEntuApi: vi.fn(),
  searchEntuEntities: vi.fn()
}))

// Helper to create a minimal EntuEntity
function makeEntity (overrides: Record<string, unknown> = {}): EntuEntity {
  return {
    _id: 'entity-1' as EntuEntityId,
    _type: [{ string: 'person', reference: '', entity_type: '' }],
    ...overrides
  } as EntuEntity
}

describe('entu-admin extractors', () => {
  describe('extractGroupsFromPerson', () => {
    it('should return empty array for non-person entity', () => {
      const entity = makeEntity({
        _type: [{ string: 'ulesanne', reference: '', entity_type: '' }]
      })
      expect(extractGroupsFromPerson(entity)).toEqual([])
    })

    it('should return empty array for person with no parents', () => {
      const entity = makeEntity({ _parent: [] })
      expect(extractGroupsFromPerson(entity)).toEqual([])
    })

    it('should return empty array for person with undefined _parent', () => {
      const entity = makeEntity()
      expect(extractGroupsFromPerson(entity)).toEqual([])
    })

    it('should extract group IDs from _parent references with entity_type grupp', () => {
      const entity = makeEntity({
        _parent: [
          { reference: 'group-1', entity_type: 'grupp', string: '' },
          { reference: 'group-2', entity_type: 'grupp', string: '' }
        ]
      })
      expect(extractGroupsFromPerson(entity)).toEqual(['group-1', 'group-2'])
    })

    it('should skip non-grupp parents', () => {
      const entity = makeEntity({
        _parent: [
          { reference: 'group-1', entity_type: 'grupp', string: '' },
          { reference: 'other-1', entity_type: 'kool', string: '' }
        ]
      })
      expect(extractGroupsFromPerson(entity)).toEqual(['group-1'])
    })

    it('should skip parents without reference', () => {
      const entity = makeEntity({
        _parent: [
          { entity_type: 'grupp', string: 'Group Name' }
        ]
      })
      expect(extractGroupsFromPerson(entity)).toEqual([])
    })

    it('should return empty array when _type is missing', () => {
      const entity = { _id: 'x' as EntuEntityId, _type: [] } as EntuEntity
      expect(extractGroupsFromPerson(entity)).toEqual([])
    })
  })

  describe('extractGroupFromTask', () => {
    function makeTask (overrides: Record<string, unknown> = {}): EntuEntity {
      return {
        _id: 'task-1' as EntuEntityId,
        _type: [{ string: 'ulesanne', reference: '', entity_type: '' }],
        ...overrides
      } as EntuEntity
    }

    it('should return null for non-task entity', () => {
      const entity = makeEntity({
        _type: [{ string: 'person', reference: '', entity_type: '' }]
      })
      expect(extractGroupFromTask(entity)).toBeNull()
    })

    it('should return null for task with no grupp property', () => {
      const task = makeTask()
      expect(extractGroupFromTask(task)).toBeNull()
    })

    it('should return null for task with empty grupp array', () => {
      const task = makeTask({ grupp: [] })
      expect(extractGroupFromTask(task)).toBeNull()
    })

    it('should extract group reference from first grupp entry', () => {
      const task = makeTask({
        grupp: [{ reference: 'group-123', string: '' }]
      })
      expect(extractGroupFromTask(task)).toBe('group-123')
    })

    it('should return first group when multiple exist', () => {
      const task = makeTask({
        grupp: [
          { reference: 'group-1', string: '' },
          { reference: 'group-2', string: '' }
        ]
      })
      expect(extractGroupFromTask(task)).toBe('group-1')
    })

    it('should return null when grupp entry has no reference', () => {
      const task = makeTask({
        grupp: [{ string: 'Some Group' }]
      })
      expect(extractGroupFromTask(task)).toBeNull()
    })
  })
})
