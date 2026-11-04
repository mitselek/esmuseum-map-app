/**
 * Tests for server/api/onboard/ endpoints
 *
 * Tests check-membership, get-group-info, validate-user, join-group, class-status
 * Uses MSW + helpers to mock Entu API and Nuxt runtime
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { server } from '../../setup'
import { installNuxtMocks, cleanupNuxtMocks } from '../../helpers/nuxt-runtime-mock'
import { createMockH3Event } from '../../helpers/h3-event-mock'
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

// Mock createLogger
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// The endpoints use exchangeApiKeyForToken which calls /auth.
// MSW's authHandler handles that. getEntuApiConfig uses config.public.entuUrl and config.entuClientId.
// We need to match these in the runtime config.

describe('onboard endpoints', () => {
  beforeEach(() => {
    installNuxtMocks({
      entuKey: 'test-key',
      entuClientId: 'esmuuseum'
    })
    // Add entuManagerKey to the config
    const origConfig = (globalThis as any).useRuntimeConfig()
    ;(globalThis as any).useRuntimeConfig = () => ({
      ...origConfig,
      entuManagerKey: 'test-manager-key'
    })

    server.use(...entuServerHandlers)
    clearEntities()
    clearCreatedEntities()
  })

  afterEach(() => {
    cleanupNuxtMocks()
  })

  describe('check-membership', () => {
    // Import handler — defineEventHandler is identity function in our mock
    let handler: (event: any) => Promise<any>

    beforeEach(async () => {
      vi.resetModules()
      // Re-apply mocks after resetModules
      vi.mock('../../../server/utils/logger', () => ({
        createLogger: () => ({
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        })
      }))
      const mod = await import('../../../server/api/onboard/check-membership.get')
      handler = mod.default as any
    })

    it('should return error for missing groupId', async () => {
      const event = createMockH3Event({ query: { userId: 'user-1' } })
      const result = await handler(event)
      expect(result.isMember).toBe(false)
      expect(result.error).toContain('Missing')
    })

    it('should return error for missing userId', async () => {
      const event = createMockH3Event({ query: { groupId: 'group-1' } })
      const result = await handler(event)
      expect(result.isMember).toBe(false)
      expect(result.error).toContain('Missing')
    })

    it('should return isMember=true when user is in group', async () => {
      seedEntities([
        buildMockPerson('user-1'),
        buildMockPerson('user-2')
      ])

      const event = createMockH3Event({
        query: { groupId: 'group-1', userId: 'user-1' }
      })
      const result = await handler(event)
      expect(result.isMember).toBe(true)
    })

    it('should return isMember=false when user is not in group', async () => {
      seedEntities([
        buildMockPerson('user-2') // different user
      ])

      const event = createMockH3Event({
        query: { groupId: 'group-1', userId: 'user-1' }
      })
      const result = await handler(event)
      expect(result.isMember).toBe(false)
    })
  })

  describe('get-group-info', () => {
    let handler: (event: any) => Promise<any>

    beforeEach(async () => {
      vi.resetModules()
      vi.mock('../../../server/utils/logger', () => ({
        createLogger: () => ({
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        })
      }))
      const mod = await import('../../../server/api/onboard/get-group-info.get')
      handler = mod.default as any
    })

    it('should return error for missing groupId', async () => {
      const event = createMockH3Event({ query: {} })
      const result = await handler(event)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Missing groupId')
    })

    it('should return group info for valid groupId', async () => {
      seedEntities([{
        _id: 'group-123',
        _type: [{ string: 'grupp' }],
        name: [{ string: 'Class 10A' }]
      }])

      const event = createMockH3Event({ query: { groupId: 'group-123' } })
      const result = await handler(event)
      expect(result.success).toBe(true)
      expect(result.groupId).toBe('group-123')
      expect(result.groupName).toBe('Class 10A')
    })

    it('should return "Unknown Group" when name is missing', async () => {
      seedEntities([{
        _id: 'group-456',
        _type: [{ string: 'grupp' }]
        // no name property
      }])

      const event = createMockH3Event({ query: { groupId: 'group-456' } })
      const result = await handler(event)
      expect(result.success).toBe(true)
      expect(result.groupName).toBe('Unknown Group')
    })
  })

  describe('validate-user', () => {
    let handler: (event: any) => Promise<any>

    beforeEach(async () => {
      vi.resetModules()
      vi.mock('../../../server/utils/logger', () => ({
        createLogger: () => ({
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        })
      }))
      const mod = await import('../../../server/api/onboard/validate-user.get')
      handler = mod.default as any
    })

    it('should return error for missing userId', async () => {
      const event = createMockH3Event({ query: {} })
      const result = await handler(event)
      expect(result.exists).toBe(false)
      expect(result.error).toContain('Missing userId')
    })

    it('should return exists=true for existing user', async () => {
      seedEntities([buildMockPerson('user-abc')])

      const event = createMockH3Event({ query: { userId: 'user-abc' } })
      const result = await handler(event)
      expect(result.exists).toBe(true)
    })

    it('should return exists=false for non-existent user', async () => {
      seedEntities([]) // empty

      const event = createMockH3Event({ query: { userId: 'ghost-user' } })
      const result = await handler(event)
      expect(result.exists).toBe(false)
    })
  })

  describe('join-group', () => {
    let handler: (event: any) => Promise<any>

    beforeEach(async () => {
      vi.resetModules()
      vi.mock('../../../server/utils/logger', () => ({
        createLogger: () => ({
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        })
      }))
      const mod = await import('../../../server/api/onboard/join-group.post')
      handler = mod.default as any
    })

    it('should return 400 for missing groupId', async () => {
      const event = createMockH3Event({
        method: 'POST',
        body: { userId: 'user-1' }
      })
      const result = await handler(event)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Missing')
    })

    it('should return 400 for missing userId', async () => {
      const event = createMockH3Event({
        method: 'POST',
        body: { groupId: 'group-1' }
      })
      const result = await handler(event)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Missing')
    })

    it('should return success if user is already a member', async () => {
      // Seed the user as a person entity — search will find them
      seedEntities([buildMockPerson('user-1')])

      const event = createMockH3Event({
        method: 'POST',
        body: { groupId: 'group-1', userId: 'user-1' }
      })
      const result = await handler(event)
      expect(result.success).toBe(true)
      expect(result.message).toContain('already')
    })

    it('should assign user to group when not yet a member', async () => {
      // Empty store — user not found in search, so not a member
      seedEntities([
        buildMockEntity('user-1', 'person'), // entity exists for POST calls
        buildMockGroup('group-1', 'Class 10A')
      ])

      // The search for person type will find user-1 (type=person),
      // and its _id matches userId, so it WILL think it's already a member.
      // We need a scenario where search returns empty or doesn't match.
      // Clear and don't seed person type entities:
      clearEntities()
      // Seed only the group and user for POST targets, but no person matching search
      seedEntities([
        buildMockGroup('group-1', 'Class 10A'),
        // user-1 is NOT type 'person' in search results — use a different type
        buildMockEntity('user-1', 'user_stub')
      ])

      const event = createMockH3Event({
        method: 'POST',
        body: { groupId: 'group-1', userId: 'user-1' }
      })
      const result = await handler(event)
      expect(result.success).toBe(true)
      expect(result.message).toContain('successfully')

      // Verify API calls were made (POST to user and group entities)
      const created = getCreatedEntities()
      expect(created.length).toBeGreaterThanOrEqual(2) // _parent on user + _viewer on group
    })

    it('should return 400 for empty body', async () => {
      const event = createMockH3Event({
        method: 'POST',
        body: null
      })
      const result = await handler(event)
      expect(result.success).toBe(false)
    })
  })

  describe('class-status', () => {
    let handler: (event: any) => Promise<any>

    // The classes root is the grupp type's default_parent (spec 033).
    const gruppType = buildMockEntity('type-grupp', 'entity', {
      name: [{ string: 'grupp' }],
      default_parent: [{ reference: 'classes-root' }]
    })
    const classA = buildMockGroup('class-a', 'Class A', {
      _parent: [{ reference: 'classes-root', entity_type: 'grupp' }]
    })
    const allUsers = buildMockGroup('all-users', 'Kasutajad', {
      _parent: [{ reference: 'database', entity_type: 'database' }]
    })
    const parents = (...refs: Array<[string, string]>) => ({
      _parent: refs.map(([reference, entity_type]) => ({ reference, entity_type }))
    })

    beforeEach(async () => {
      vi.resetModules()
      vi.mock('../../../server/utils/logger', () => ({
        createLogger: () => ({
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        })
      }))
      const mod = await import('../../../server/api/onboard/class-status.get')
      handler = mod.default as any
    })

    it('answers in-class for a member of a class', async () => {
      seedEntities([gruppType, classA, allUsers,
        buildMockPerson('user-1', parents(['all-users', 'grupp'], ['class-a', 'grupp']))])

      const result = await handler(createMockH3Event({ query: { userId: 'user-1' } }))
      expect(result).toEqual({ status: 'in-class' })
    })

    it('answers no-class when the only grupp parent is the all-users group', async () => {
      seedEntities([gruppType, classA, allUsers,
        buildMockPerson('user-1', parents(['all-users', 'grupp'], ['persons-menu', 'menu']))])

      const result = await handler(createMockH3Event({ query: { userId: 'user-1' } }))
      expect(result).toEqual({ status: 'no-class' })
    })

    it('answers no-class for a person with no parents', async () => {
      seedEntities([gruppType, classA, buildMockPerson('user-1')])

      const result = await handler(createMockH3Event({ query: { userId: 'user-1' } }))
      expect(result).toEqual({ status: 'no-class' })
    })

    it('answers unknown with 400 when userId is missing', async () => {
      const result = await handler(createMockH3Event({ query: {} }))
      expect(result.status).toBe('unknown')
      expect(result.error).toContain('Missing')
      expect((globalThis as any).setResponseStatus).toHaveBeenCalledWith(expect.anything(), 400)
    })

    it('answers unknown with 500 when the person cannot be read', async () => {
      seedEntities([gruppType, classA])

      const result = await handler(createMockH3Event({ query: { userId: 'user-missing' } }))
      expect(result.status).toBe('unknown')
      expect((globalThis as any).setResponseStatus).toHaveBeenCalledWith(expect.anything(), 500)
    })

    it('answers unknown with 500 when the classes root cannot be found', async () => {
      seedEntities([classA, buildMockPerson('user-1', parents(['class-a', 'grupp']))])

      const result = await handler(createMockH3Event({ query: { userId: 'user-1' } }))
      expect(result.status).toBe('unknown')
      expect((globalThis as any).setResponseStatus).toHaveBeenCalledWith(expect.anything(), 500)
    })
  })
})
