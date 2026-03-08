/**
 * Tests for student-added-to-class webhook handler
 *
 * Tests the orchestration: read body → validate → queue → fetch entity →
 * check groups → grant viewer permissions → find tasks → batch grant expander permissions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { installNuxtMocks, cleanupNuxtMocks } from '../../helpers/nuxt-runtime-mock'
import { createMockJWT } from '../../mocks/jwt-tokens'

// --- Mock h3 so readBody returns our event._body ---

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()
  return {
    ...actual,
    defineEventHandler: (handler: (event: unknown) => unknown) => handler,
    readBody: async (event: unknown) => (event as { _body: unknown })._body
  }
})

// --- Mock server dependencies ---

const mockGetEntityDetails = vi.fn()
const mockExtractGroupsFromPerson = vi.fn()
const mockGetTasksByGroup = vi.fn()
const mockBatchGrantPermissions = vi.fn()
const mockAddViewerPermission = vi.fn()

vi.mock('../../../server/utils/entu-admin', () => ({
  getEntityDetails: (...args: unknown[]) => mockGetEntityDetails(...args),
  extractGroupsFromPerson: (...args: unknown[]) => mockExtractGroupsFromPerson(...args),
  getTasksByGroup: (...args: unknown[]) => mockGetTasksByGroup(...args),
  batchGrantPermissions: (...args: unknown[]) => mockBatchGrantPermissions(...args),
  addViewerPermission: (...args: unknown[]) => mockAddViewerPermission(...args)
}))

const mockEnqueueWebhook = vi.fn()
const mockCompleteWebhookProcessing = vi.fn()

vi.mock('../../../server/utils/webhook-queue', () => ({
  enqueueWebhook: (...args: unknown[]) => mockEnqueueWebhook(...args),
  completeWebhookProcessing: (...args: unknown[]) => mockCompleteWebhookProcessing(...args)
}))

vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

// Build a valid webhook payload
function buildWebhookPayload (entityId: string, token?: string) {
  return {
    db: 'esmuuseum',
    entity: { _id: entityId },
    token: token ?? createMockJWT({
      user: { email: 'teacher@school.ee' },
      accounts: { esmuuseum: 'teacher-id' },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    })
  }
}

// Import handler after mocks
let handler: (event: unknown) => Promise<unknown>

beforeEach(async () => {
  vi.resetAllMocks()
  installNuxtMocks()

  // Default: queue accepts, no reprocessing
  mockEnqueueWebhook.mockReturnValue(true)
  mockCompleteWebhookProcessing.mockReturnValue(false)

  const mod = await import('../../../server/api/webhooks/student-added-to-class.post')
  handler = mod.default as unknown as (event: unknown) => Promise<unknown>
})

afterEach(() => {
  cleanupNuxtMocks()
})

// Minimal mock event
function createEvent (body: unknown) {
  return {
    _headers: { 'x-forwarded-for': '127.0.0.1' },
    _query: {},
    _body: body,
    _cookies: {},
    context: { params: {} },
    node: {
      req: { method: 'POST', url: '/', headers: { 'x-forwarded-for': '127.0.0.1' } },
      res: { statusCode: 200, setHeader: vi.fn(), end: vi.fn() }
    }
  }
}

describe('student-added-to-class webhook', () => {
  describe('happy path', () => {
    it('should grant permissions when student has groups with tasks', async () => {
      const personEntity = {
        _id: 'student-1',
        _type: [{ string: 'person' }],
        _parent: [{ entity_type: 'grupp', reference: 'group-1' }]
      }
      const taskEntity = { _id: 'task-1', _type: [{ string: 'ulesanne' }] }

      mockGetEntityDetails.mockResolvedValue(personEntity)
      mockExtractGroupsFromPerson.mockReturnValue(['group-1'])
      mockAddViewerPermission.mockResolvedValue({})
      mockGetTasksByGroup.mockResolvedValue([taskEntity])
      mockBatchGrantPermissions.mockResolvedValue({
        total: 1, successful: 1, failed: 0, skipped: 0, details: []
      })

      const result = await handler(createEvent(buildWebhookPayload('student-1')))

      expect(result).toMatchObject({
        success: true,
        person_id: 'student-1',
        groups_found: 1,
        tasks_found: 1,
        permissions_granted: 1
      })
      expect(mockAddViewerPermission).toHaveBeenCalledWith(
        'group-1', 'student-1',
        expect.any(String), expect.anything(), expect.anything()
      )
      expect(mockBatchGrantPermissions).toHaveBeenCalledWith(
        ['task-1'], ['student-1'],
        expect.any(String), expect.anything(), expect.anything()
      )
    })

    it('should handle student with no groups', async () => {
      mockGetEntityDetails.mockResolvedValue({ _id: 's', _type: [{ string: 'person' }] })
      mockExtractGroupsFromPerson.mockReturnValue([])

      const result = await handler(createEvent(buildWebhookPayload('s')))

      expect(result).toMatchObject({
        success: true,
        groups_found: 0,
        tasks_found: 0,
        permissions_granted: 0
      })
      expect(mockGetTasksByGroup).not.toHaveBeenCalled()
    })

    it('should handle groups with no tasks', async () => {
      mockGetEntityDetails.mockResolvedValue({ _id: 's', _type: [{ string: 'person' }] })
      mockExtractGroupsFromPerson.mockReturnValue(['group-1'])
      mockAddViewerPermission.mockResolvedValue({})
      mockGetTasksByGroup.mockResolvedValue([])

      const result = await handler(createEvent(buildWebhookPayload('s')))

      expect(result).toMatchObject({
        success: true,
        groups_found: 1,
        tasks_found: 0,
        permissions_granted: 0
      })
      expect(mockBatchGrantPermissions).not.toHaveBeenCalled()
    })

    it('should deduplicate tasks across multiple groups', async () => {
      const sharedTask = { _id: 'task-shared' }
      const uniqueTask = { _id: 'task-unique' }

      mockGetEntityDetails.mockResolvedValue({ _id: 's', _type: [{ string: 'person' }] })
      mockExtractGroupsFromPerson.mockReturnValue(['group-1', 'group-2'])
      mockAddViewerPermission.mockResolvedValue({})
      mockGetTasksByGroup
        .mockResolvedValueOnce([sharedTask])
        .mockResolvedValueOnce([sharedTask, uniqueTask])
      mockBatchGrantPermissions.mockResolvedValue({
        total: 2, successful: 2, failed: 0, skipped: 0, details: []
      })

      const result = await handler(createEvent(buildWebhookPayload('s')))

      expect(result).toMatchObject({ success: true, tasks_found: 2 })
      const grantedTaskIds = mockBatchGrantPermissions.mock.calls[0]![0] as string[]
      expect(grantedTaskIds).toHaveLength(2)
      expect(grantedTaskIds).toContain('task-shared')
      expect(grantedTaskIds).toContain('task-unique')
    })
  })

  describe('payload validation', () => {
    it('should reject payload without db field', async () => {
      const payload = { entity: { _id: 'x' }, token: 'tok' }
      await expect(handler(createEvent(payload))).rejects.toMatchObject({ statusCode: 400 })
    })

    it('should reject payload without entity', async () => {
      const payload = { db: 'esmuuseum', token: 'tok' }
      await expect(handler(createEvent(payload))).rejects.toMatchObject({ statusCode: 400 })
    })

    it('should reject payload without entity._id', async () => {
      const payload = { db: 'esmuuseum', entity: {}, token: 'tok' }
      await expect(handler(createEvent(payload))).rejects.toMatchObject({ statusCode: 400 })
    })

    it('should reject payload without token', async () => {
      const payload = { db: 'esmuuseum', entity: { _id: 'x' } }
      await expect(handler(createEvent(payload))).rejects.toMatchObject({ statusCode: 400 })
    })
  })

  describe('entity not found', () => {
    it('should throw 404 when entity is not found', async () => {
      mockGetEntityDetails.mockResolvedValue(null)
      await expect(
        handler(createEvent(buildWebhookPayload('nonexistent')))
      ).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('queue debouncing', () => {
    it('should return queued response when entity is already processing', async () => {
      mockEnqueueWebhook.mockReturnValue(false)

      const result = await handler(createEvent(buildWebhookPayload('student-1')))

      expect(result).toMatchObject({
        success: true,
        queued: true,
        entity_id: 'student-1'
      })
      expect(mockGetEntityDetails).not.toHaveBeenCalled()
    })
  })

  describe('viewer permission failure is non-fatal', () => {
    it('should continue when addViewerPermission fails', async () => {
      mockGetEntityDetails.mockResolvedValue({ _id: 's', _type: [{ string: 'person' }] })
      mockExtractGroupsFromPerson.mockReturnValue(['group-1'])
      mockAddViewerPermission.mockRejectedValue(new Error('fail'))
      mockGetTasksByGroup.mockResolvedValue([{ _id: 'task-1' }])
      mockBatchGrantPermissions.mockResolvedValue({
        total: 1, successful: 1, failed: 0, skipped: 0, details: []
      })

      const result = await handler(createEvent(buildWebhookPayload('s')))

      expect(result).toMatchObject({
        success: true,
        tasks_found: 1,
        permissions_granted: 1
      })
    })
  })

  describe('response shape', () => {
    it('should include duration_ms', async () => {
      mockGetEntityDetails.mockResolvedValue({ _id: 's', _type: [{ string: 'person' }] })
      mockExtractGroupsFromPerson.mockReturnValue([])

      const result = await handler(createEvent(buildWebhookPayload('s'))) as Record<string, unknown>

      expect(result).toHaveProperty('duration_ms')
      expect(typeof result.duration_ms).toBe('number')
    })
  })
})
