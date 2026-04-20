/**
 * Tests for server/utils/entu.ts
 *
 * Tests callEntuApi, searchEntuEntities, createEntuEntity with MSW
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { server } from '../../setup'
import { installNuxtMocks, cleanupNuxtMocks } from '../../helpers/nuxt-runtime-mock'
import {
  entuServerHandlers,
  seedEntities,
  clearEntities,
  clearCreatedEntities,
  getCreatedEntities,
  buildMockEntity,
  buildMockPerson
} from '../../helpers/entu-api-mock'

import {
  callEntuApi,
  getEntuEntity,
  createEntuEntity,
  searchEntuEntities,
  updateEntuEntity,
  getEntuApiConfig
} from '../../../server/utils/entu'

// Mock createLogger
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

const apiConfig = {
  token: 'test-token',
  apiUrl: 'https://api.entu.app',
  accountName: 'esmuuseum'
}

describe('server/utils/entu', () => {
  beforeEach(() => {
    installNuxtMocks()
    server.use(...entuServerHandlers)
    clearEntities()
    clearCreatedEntities()
  })

  afterEach(() => {
    cleanupNuxtMocks()
  })

  describe('callEntuApi', () => {
    it('should make authenticated GET request and return JSON', async () => {
      seedEntities([buildMockEntity('entity-1', 'ulesanne')])

      const result = await callEntuApi('/entity/entity-1', {}, apiConfig)
      expect(result.entity).toBeDefined()
      expect(result.entity._id).toBe('entity-1')
    })

    it('should throw on non-OK response', async () => {
      // Request a non-existent entity — MSW returns 404
      seedEntities([])

      await expect(
        callEntuApi('/entity/nonexistent', {}, apiConfig)
      ).rejects.toThrow()
    })

    it('should make POST request with body', async () => {
      seedEntities([buildMockEntity('entity-2', 'ulesanne')])

      const result = await callEntuApi('/entity/entity-2', {
        method: 'POST',
        body: JSON.stringify([{ type: '_expander', reference: 'user-1' }])
      }, apiConfig)

      expect(result._id).toBe('entity-2')
    })
  })

  describe('getEntuEntity', () => {
    it('should fetch entity by ID', async () => {
      seedEntities([buildMockPerson('person-1')])

      const result = await getEntuEntity('person-1', apiConfig)
      expect(result.entity._id).toBe('person-1')
    })

    it('should throw for non-existent entity', async () => {
      seedEntities([])
      await expect(getEntuEntity('missing', apiConfig)).rejects.toThrow()
    })
  })

  describe('createEntuEntity', () => {
    it('should create entity with correct property format', async () => {
      const result = await createEntuEntity('vastus', {
        vastus: 'My answer',
        seadme_gps: '59.437,24.745'
      }, apiConfig)

      expect(result._id).toBeDefined()

      // Verify the request body was sent
      const created = getCreatedEntities()
      expect(created.length).toBeGreaterThan(0)
    })

    it('should include _type and _inheritrights in properties', async () => {
      await createEntuEntity('vastus', { note: 'test' }, apiConfig)

      const created = getCreatedEntities()
      expect(created.length).toBe(1)

      const body = created[0]!.body as Array<{ type: string, reference?: string, boolean?: boolean, string?: string }>
      const typeProperty = body.find((p) => p.type === '_type')
      const inheritProperty = body.find((p) => p.type === '_inheritrights')

      expect(typeProperty).toBeDefined()
      expect(typeProperty!.reference).toBeDefined()
      expect(inheritProperty).toBeDefined()
      expect(inheritProperty!.boolean).toBe(true)
    })

    it('should handle reference properties (ulesanne, _parent)', async () => {
      await createEntuEntity('vastus', {
        ulesanne: 'task-ref-123',
        _parent: 'parent-ref-456'
      }, apiConfig)

      const created = getCreatedEntities()
      const body = created[0]!.body as Array<{ type: string, reference?: string }>
      const taskRef = body.find((p) => p.type === 'ulesanne')
      const parentRef = body.find((p) => p.type === '_parent')

      expect(taskRef?.reference).toBe('task-ref-123')
      expect(parentRef?.reference).toBe('parent-ref-456')
    })

    it('should handle string, number, and boolean properties', async () => {
      await createEntuEntity('vastus', {
        note: 'hello',
        score: 42,
        active: true
      }, apiConfig)

      const created = getCreatedEntities()
      const body = created[0]!.body as Array<{ type: string, string?: string, number?: number, boolean?: boolean }>
      const noteProp = body.find((p) => p.type === 'note')
      const scoreProp = body.find((p) => p.type === 'score')
      const activeProp = body.find((p) => p.type === 'active')

      expect(noteProp?.string).toBe('hello')
      expect(scoreProp?.number).toBe(42)
      expect(activeProp?.boolean).toBe(true)
    })

    it('should skip null and undefined values', async () => {
      await createEntuEntity('vastus', {
        note: 'keep',
        empty: null,
        missing: undefined
      }, apiConfig)

      const created = getCreatedEntities()
      const body = created[0]!.body as Array<{ type: string }>
      const types = body.map((p) => p.type)

      expect(types).toContain('note')
      expect(types).not.toContain('empty')
      expect(types).not.toContain('missing')
    })
  })

  describe('searchEntuEntities', () => {
    it('should search entities by type', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne'),
        buildMockEntity('task-2', 'ulesanne'),
        buildMockEntity('person-1', 'person')
      ])

      const result = await searchEntuEntities({
        '_type.string': 'ulesanne'
      }, apiConfig)

      expect(result.entities).toHaveLength(2)
    })

    it('should return all entities when no type filter', async () => {
      seedEntities([
        buildMockEntity('a', 'ulesanne'),
        buildMockEntity('b', 'person')
      ])

      const result = await searchEntuEntities({}, apiConfig)
      expect(result.entities).toHaveLength(2)
    })

    it('should filter undefined query params', async () => {
      seedEntities([buildMockEntity('a', 'ulesanne')])

      const result = await searchEntuEntities({
        '_type.string': 'ulesanne',
        'grupp.reference': undefined
      }, apiConfig)

      expect(result.entities).toHaveLength(1)
    })
  })

  describe('updateEntuEntity', () => {
    it('should POST update to entity endpoint', async () => {
      seedEntities([buildMockEntity('entity-x', 'ulesanne')])

      const result = await updateEntuEntity('entity-x', { note: 'updated' }, apiConfig)
      expect(result._id).toBe('entity-x')
    })
  })

  describe('getEntuApiConfig', () => {
    it('should return config with token and runtime values', () => {
      const config = getEntuApiConfig('my-token')
      expect(config.token).toBe('my-token')
      expect(config.apiUrl).toBeDefined()
      expect(config.accountName).toBeDefined()
    })
  })
})
