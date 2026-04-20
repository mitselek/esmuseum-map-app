/**
 * Tests for server/utils/entu-admin.ts API functions
 *
 * Tests addExpanderPermission, addViewerPermission, addMultipleExpanderPermissions,
 * batchGrantPermissions, getTasksByGroup, getStudentsByGroup, getEntityDetails,
 * hasExpanderPermission, getAdminApiConfig — all using MSW
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
  buildMockPerson,
  buildMockGroup
} from '../../helpers/entu-api-mock'

import {
  getAdminApiConfig,
  addExpanderPermission,
  addViewerPermission,
  addMultipleExpanderPermissions,
  batchGrantPermissions,
  getTasksByGroup,
  getStudentsByGroup,
  getEntityDetails,
  hasExpanderPermission
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

describe('server/utils/entu-admin API functions', () => {
  beforeEach(() => {
    installNuxtMocks()
    server.use(...entuServerHandlers)
    clearEntities()
    clearCreatedEntities()
  })

  afterEach(() => {
    cleanupNuxtMocks()
  })

  describe('getAdminApiConfig', () => {
    it('should return config with user token', () => {
      const config = getAdminApiConfig('user-jwt-token', 'user-1', 'user@test.ee')
      expect(config.token).toBe('user-jwt-token')
      expect(config.apiUrl).toBe('https://api.entu.app')
      expect(config.accountName).toBe('esmuuseum')
    })

    it('should throw when no user token provided', () => {
      expect(() => getAdminApiConfig(undefined, 'user-1')).toThrow()
    })

    it('should throw when user token is empty string', () => {
      expect(() => getAdminApiConfig('', 'user-1')).toThrow()
    })
  })

  describe('addExpanderPermission', () => {
    it('should POST _expander permission to entity', async () => {
      seedEntities([buildMockEntity('task-1', 'ulesanne')])

      await addExpanderPermission('task-1', 'student-1', 'jwt-token')

      const created = getCreatedEntities()
      expect(created.length).toBe(1)
      const body = created[0]!.body as Array<{ type: string, reference: string }>
      expect(body).toContainEqual({ type: '_expander', reference: 'student-1' })
    })

    it('should throw when no token provided', async () => {
      await expect(
        addExpanderPermission('task-1', 'student-1')
      ).rejects.toThrow()
    })
  })

  describe('addViewerPermission', () => {
    it('should POST _viewer permission to entity', async () => {
      seedEntities([buildMockGroup('group-1', 'Class 10A')])

      await addViewerPermission('group-1', 'student-1', 'jwt-token')

      const created = getCreatedEntities()
      expect(created.length).toBe(1)
      const body = created[0]!.body as Array<{ type: string, reference: string }>
      expect(body).toContainEqual({ type: '_viewer', reference: 'student-1' })
    })
  })

  describe('addMultipleExpanderPermissions', () => {
    it('should POST multiple _expander permissions in single call', async () => {
      seedEntities([buildMockEntity('task-1', 'ulesanne')])

      await addMultipleExpanderPermissions(
        'task-1',
        ['student-1', 'student-2', 'student-3'],
        'jwt-token'
      )

      const created = getCreatedEntities()
      expect(created.length).toBe(1)
      const body = created[0]!.body as Array<{ type: string, reference: string }>
      expect(body).toHaveLength(3)
      expect(body).toContainEqual({ type: '_expander', reference: 'student-1' })
      expect(body).toContainEqual({ type: '_expander', reference: 'student-2' })
      expect(body).toContainEqual({ type: '_expander', reference: 'student-3' })
    })
  })

  describe('getTasksByGroup', () => {
    it('should search for ulesanne entities by grupp reference', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne'),
        buildMockEntity('task-2', 'ulesanne'),
        buildMockEntity('person-1', 'person')
      ])

      // MSW handler filters by _type.string
      const tasks = await getTasksByGroup('group-1', 'jwt-token')
      // Returns ulesanne entities (MSW filters by type)
      expect(tasks).toHaveLength(2)
    })
  })

  describe('getStudentsByGroup', () => {
    it('should search for person entities in group', async () => {
      seedEntities([
        buildMockPerson('student-1'),
        buildMockPerson('student-2'),
        buildMockEntity('task-1', 'ulesanne')
      ])

      const students = await getStudentsByGroup('group-1', 'jwt-token')
      expect(students).toHaveLength(2)
    })
  })

  describe('getEntityDetails', () => {
    it('should fetch and return entity details', async () => {
      seedEntities([buildMockPerson('person-42')])

      const entity = await getEntityDetails('person-42', 'jwt-token')
      expect(entity).toBeDefined()
      expect(entity!._id).toBe('person-42')
    })

    it('should throw for non-existent entity', async () => {
      seedEntities([])
      await expect(getEntityDetails('nonexistent', 'jwt-token')).rejects.toThrow()
    })
  })

  describe('hasExpanderPermission', () => {
    it('should return true when person has _expander permission', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne', {
          _expander: [{ reference: 'student-1' }]
        })
      ])

      const result = await hasExpanderPermission('task-1', 'student-1', 'jwt-token')
      expect(result).toBe(true)
    })

    it('should return false when person does not have permission', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne', {
          _expander: [{ reference: 'other-student' }]
        })
      ])

      const result = await hasExpanderPermission('task-1', 'student-1', 'jwt-token')
      expect(result).toBe(false)
    })

    it('should return false when entity has no _expander array', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne')
      ])

      const result = await hasExpanderPermission('task-1', 'student-1', 'jwt-token')
      expect(result).toBe(false)
    })

    it('should return false when entity does not exist', async () => {
      seedEntities([])

      const result = await hasExpanderPermission('nonexistent', 'student-1', 'jwt-token')
      expect(result).toBe(false)
    })
  })

  describe('batchGrantPermissions', () => {
    it('should grant permissions to multiple persons on multiple entities', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne'),
        buildMockEntity('task-2', 'ulesanne')
      ])

      const result = await batchGrantPermissions(
        ['task-1', 'task-2'],
        ['student-1', 'student-2'],
        'jwt-token'
      )

      expect(result.total).toBe(4)
      expect(result.successful).toBe(4)
      expect(result.failed).toBe(0)
    })

    it('should skip already-existing permissions', async () => {
      seedEntities([
        buildMockEntity('task-1', 'ulesanne', {
          _expander: [{ reference: 'student-1' }]
        })
      ])

      const result = await batchGrantPermissions(
        ['task-1'],
        ['student-1', 'student-2'],
        'jwt-token'
      )

      expect(result.total).toBe(2)
      expect(result.skipped).toBe(1) // student-1 already has permission
      expect(result.successful).toBe(1) // student-2 gets permission
    })

    it('should handle empty arrays', async () => {
      const result = await batchGrantPermissions([], [], 'jwt-token')
      expect(result.total).toBe(0)
      expect(result.successful).toBe(0)
    })
  })
})
