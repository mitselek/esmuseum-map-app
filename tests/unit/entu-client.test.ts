/**
 * Tests for app/utils/entu-client.ts
 *
 * Client-side Entu API utilities: updateUserName, joinGroup
 * Both use fetch() directly — mock global.fetch
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { updateUserName, joinGroup } from '../../app/utils/entu-client'

describe('entu-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('updateUserName', () => {
    it('should POST forename and surname to Entu API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      vi.stubGlobal('fetch', mockFetch)

      await updateUserName('user-123', 'John', 'Doe', 'test-token')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]!
      expect(url).toBe('https://entu.app/api/esmuuseum/entity/user-123')
      expect(options.method).toBe('POST')
      expect(options.headers.Authorization).toBe('Bearer test-token')
      expect(options.headers['Content-Type']).toBe('application/json')

      const body = JSON.parse(options.body)
      expect(body).toEqual([
        { type: 'forename', string: 'John' },
        { type: 'surname', string: 'Doe' }
      ])
    })

    it('should not throw on success', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
      await expect(updateUserName('u1', 'A', 'B', 'tok')).resolves.toBeUndefined()
    })

    it('should throw on non-ok response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('Access denied')
      }))

      await expect(updateUserName('u1', 'A', 'B', 'tok'))
        .rejects.toThrow('Failed to update name: 403 Forbidden - Access denied')
    })

    it('should throw on 500 server error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('DB error')
      }))

      await expect(updateUserName('u1', 'A', 'B', 'tok'))
        .rejects.toThrow('Failed to update name: 500')
    })

    it('should propagate fetch errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
      await expect(updateUserName('u1', 'A', 'B', 'tok'))
        .rejects.toThrow('Network error')
    })
  })

  describe('joinGroup', () => {
    it('should POST _parent reference to Entu API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      vi.stubGlobal('fetch', mockFetch)

      await joinGroup('user-456', 'group-789', 'my-token')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]!
      expect(url).toBe('https://entu.app/api/esmuuseum/entity/user-456')
      expect(options.method).toBe('POST')
      expect(options.headers.Authorization).toBe('Bearer my-token')

      const body = JSON.parse(options.body)
      expect(body).toEqual([
        { type: '_parent', reference: 'group-789' }
      ])
    })

    it('should not throw on success', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
      await expect(joinGroup('u1', 'g1', 'tok')).resolves.toBeUndefined()
    })

    it('should throw on non-ok response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Entity not found')
      }))

      await expect(joinGroup('u1', 'g1', 'tok'))
        .rejects.toThrow('Failed to join group: 404 Not Found - Entity not found')
    })

    it('should propagate fetch errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Timeout')))
      await expect(joinGroup('u1', 'g1', 'tok'))
        .rejects.toThrow('Timeout')
    })
  })
})
