/**
 * Tests for server/api/upload-proxy.post.ts
 *
 * CORS proxy for file uploads to DigitalOcean via Entu's signed URLs
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../setup'
import { installNuxtMocks, cleanupNuxtMocks } from '../../helpers/nuxt-runtime-mock'

// Mock createLogger
vi.mock('../../../server/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

// The upload-proxy endpoint uses h3's readMultipartFormData and defineEventHandler.
// We need to mock readMultipartFormData since our mock events don't support multipart parsing.

// Helper to create a mock multipart form data result
function createMockFormData (fields: Array<{ name: string, data: Buffer, filename?: string }>) {
  return fields.map((f) => ({
    name: f.name,
    data: f.data,
    filename: f.filename,
    type: f.filename ? 'application/octet-stream' : 'text/plain'
  }))
}

describe('upload-proxy', () => {
  let handler: (event: any) => Promise<any>
  let mockReadMultipartFormData: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    installNuxtMocks()

    // Mock h3's readMultipartFormData
    mockReadMultipartFormData = vi.fn()

    // We need to mock the h3 import used by the endpoint
    vi.doMock('h3', async (importOriginal) => {
      const actual = await importOriginal<typeof import('h3')>()
      return {
        ...actual,
        readMultipartFormData: mockReadMultipartFormData,
        defineEventHandler: (h: any) => h
      }
    })

    vi.resetModules()
    vi.mock('../../../server/utils/logger', () => ({
      createLogger: () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      })
    }))

    const mod = await import('../../../server/api/upload-proxy.post')
    handler = mod.default as any
  })

  afterEach(() => {
    cleanupNuxtMocks()
    vi.restoreAllMocks()
  })

  it('should return error when no form data received', async () => {
    mockReadMultipartFormData.mockResolvedValue(null)

    const result = await handler({})
    expect(result.success).toBe(false)
    expect(result.error).toContain('No form data')
  })

  it('should return error when file is missing', async () => {
    mockReadMultipartFormData.mockResolvedValue(
      createMockFormData([
        { name: 'uploadUrl', data: Buffer.from('https://example.com/upload') }
      ])
    )

    const result = await handler({})
    expect(result.success).toBe(false)
    expect(result.error).toContain('Missing required fields')
  })

  it('should return error when uploadUrl is missing', async () => {
    mockReadMultipartFormData.mockResolvedValue(
      createMockFormData([
        { name: 'file', data: Buffer.from('file-content'), filename: 'photo.jpg' }
      ])
    )

    const result = await handler({})
    expect(result.success).toBe(false)
    expect(result.error).toContain('Missing required fields')
  })

  it('should return error for invalid upload URL', async () => {
    mockReadMultipartFormData.mockResolvedValue(
      createMockFormData([
        { name: 'file', data: Buffer.from('file-content'), filename: 'photo.jpg' },
        { name: 'uploadUrl', data: Buffer.from('not-a-valid-url') }
      ])
    )

    const result = await handler({})
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid upload URL')
  })

  it('should upload file successfully via proxy', async () => {
    const uploadUrl = 'https://digitalocean-spaces.example.com/bucket/file.jpg'

    // MSW handler for the upload URL
    server.use(
      http.put(uploadUrl, () => {
        return new HttpResponse(null, { status: 200 })
      })
    )

    mockReadMultipartFormData.mockResolvedValue(
      createMockFormData([
        { name: 'file', data: Buffer.from('file-content'), filename: 'photo.jpg' },
        { name: 'uploadUrl', data: Buffer.from(uploadUrl) },
        { name: 'headers', data: Buffer.from(JSON.stringify({ 'Content-Type': 'image/jpeg' })) }
      ])
    )

    const result = await handler({})
    expect(result.success).toBe(true)
    expect(result.filename).toBe('photo.jpg')
    expect(result.size).toBe(Buffer.from('file-content').length)
  })

  it('should return error when upload to DigitalOcean fails', async () => {
    const uploadUrl = 'https://digitalocean-spaces.example.com/bucket/fail.jpg'

    server.use(
      http.put(uploadUrl, () => {
        return new HttpResponse('Forbidden', { status: 403, statusText: 'Forbidden' })
      })
    )

    mockReadMultipartFormData.mockResolvedValue(
      createMockFormData([
        { name: 'file', data: Buffer.from('file-content'), filename: 'fail.jpg' },
        { name: 'uploadUrl', data: Buffer.from(uploadUrl) }
      ])
    )

    const result = await handler({})
    expect(result.success).toBe(false)
    expect(result.error).toContain('Upload failed')
  })

  it('should handle missing headers gracefully (empty object)', async () => {
    const uploadUrl = 'https://digitalocean-spaces.example.com/bucket/noheaders.jpg'

    server.use(
      http.put(uploadUrl, () => {
        return new HttpResponse(null, { status: 200 })
      })
    )

    mockReadMultipartFormData.mockResolvedValue(
      createMockFormData([
        { name: 'file', data: Buffer.from('data'), filename: 'noheaders.jpg' },
        { name: 'uploadUrl', data: Buffer.from(uploadUrl) }
        // no headers field
      ])
    )

    const result = await handler({})
    expect(result.success).toBe(true)
  })
})
