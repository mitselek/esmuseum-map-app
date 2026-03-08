/**
 * Tests for task-assigned-to-class webhook handler
 *
 * Tests the orchestration: read body → validate → queue → fetch entity →
 * extract group → find students → batch grant expander permissions
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
const mockExtractGroupFromTask = vi.fn()
const mockGetStudentsByGroup = vi.fn()
const mockBatchGrantPermissions = vi.fn()

vi.mock('../../../server/utils/entu-admin', () => ({
  getEntityDetails: (...args: unknown[]) => mockGetEntityDetails(...args),
  extractGroupFromTask: (...args: unknown[]) => mockExtractGroupFromTask(...args),
  getStudentsByGroup: (...args: unknown[]) => mockGetStudentsByGroup(...args),
  batchGrantPermissions: (...args: unknown[]) => mockBatchGrantPermissions(...args)
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

let handler: (event: unknown) => Promise<unknown>

beforeEach(async () => {
  vi.resetAllMocks()
  installNuxtMocks()

  mockEnqueueWebhook.mockReturnValue(true)
  mockCompleteWebhookProcessing.mockReturnValue(false)

  const mod = await import('../../../server/api/webhooks/task-assigned-to-class.post')
  handler = mod.default as unknown as (event: unknown) => Promise<unknown>
})

afterEach(() => {
  cleanupNuxtMocks()
})

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

describe('task-assigned-to-class webhook', () => {
  describe('happy path', () => {
    it('should grant permissions to all students in the group', async () => {
      const taskEntity = {
        _id: 'task-1',
        _type: [{ string: 'ulesanne' }],
        grupp: [{ reference: 'group-1' }]
      }
      const students = [
        { _id: 'student-1', _type: [{ string: 'person' }] },
        { _id: 'student-2', _type: [{ string: 'person' }] }
      ]

      mockGetEntityDetails.mockResolvedValue(taskEntity)
      mockExtractGroupFromTask.mockReturnValue('group-1')
      mockGetStudentsByGroup.mockResolvedValue(students)
      mockBatchGrantPermissions.mockResolvedValue({
        total: 2, successful: 2, failed: 0, skipped: 0, details: []
      })

      const result = await handler(createEvent(buildWebhookPayload('task-1')))

      expect(result).toMatchObject({
        success: true,
        task_id: 'task-1',
        group_id: 'group-1',
        group_found: true,
        students_found: 2,
        permissions_granted: 2
      })
      expect(mockBatchGrantPermissions).toHaveBeenCalledWith(
        ['task-1'],
        ['student-1', 'student-2'],
        expect.any(String), expect.anything(), expect.anything()
      )
    })

    it('should handle task with no group assignment', async () => {
      mockGetEntityDetails.mockResolvedValue({
        _id: 'task-2', _type: [{ string: 'ulesanne' }]
      })
      mockExtractGroupFromTask.mockReturnValue(null)

      const result = await handler(createEvent(buildWebhookPayload('task-2')))

      expect(result).toMatchObject({
        success: true,
        task_id: 'task-2',
        group_found: false,
        students_found: 0,
        permissions_granted: 0
      })
      expect(mockGetStudentsByGroup).not.toHaveBeenCalled()
    })

    it('should handle group with no students', async () => {
      mockGetEntityDetails.mockResolvedValue({
        _id: 'task-3', _type: [{ string: 'ulesanne' }]
      })
      mockExtractGroupFromTask.mockReturnValue('empty-group')
      mockGetStudentsByGroup.mockResolvedValue([])

      const result = await handler(createEvent(buildWebhookPayload('task-3')))

      expect(result).toMatchObject({
        success: true,
        task_id: 'task-3',
        group_id: 'empty-group',
        group_found: true,
        students_found: 0,
        permissions_granted: 0
      })
      expect(mockBatchGrantPermissions).not.toHaveBeenCalled()
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
    it('should throw 404 when task entity is not found', async () => {
      mockGetEntityDetails.mockResolvedValue(null)
      await expect(
        handler(createEvent(buildWebhookPayload('nonexistent')))
      ).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('queue debouncing', () => {
    it('should return queued response when entity is already processing', async () => {
      mockEnqueueWebhook.mockReturnValue(false)

      const result = await handler(createEvent(buildWebhookPayload('task-1')))

      expect(result).toMatchObject({
        success: true,
        queued: true,
        entity_id: 'task-1'
      })
      expect(mockGetEntityDetails).not.toHaveBeenCalled()
    })
  })

  describe('response shape', () => {
    it('should include duration_ms', async () => {
      mockGetEntityDetails.mockResolvedValue({
        _id: 't', _type: [{ string: 'ulesanne' }]
      })
      mockExtractGroupFromTask.mockReturnValue(null)

      const result = await handler(createEvent(buildWebhookPayload('t'))) as Record<string, unknown>

      expect(result).toHaveProperty('duration_ms')
      expect(typeof result.duration_ms).toBe('number')
    })
  })
})
