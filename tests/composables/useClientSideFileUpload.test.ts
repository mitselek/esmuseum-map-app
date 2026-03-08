/**
 * Tests for useClientSideFileUpload composable
 *
 * Tests the actual composable: validateFile, upload flow, feature flag routing, error handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// ============================================================================
// Mock Nuxt auto-imports
// ============================================================================

const mockToken = ref<string | null>('test-token')
const mockUpdateEntity = vi.fn()
const mockFetchFn = vi.fn()
let mockFeatureFlag = 'false'

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

vi.stubGlobal('useNuxtApp', () => ({
  $fetch: mockFetchFn,
  $config: { public: { F015_CLIENT_SIDE_FILE_UPLOAD: mockFeatureFlag } }
}))

vi.stubGlobal('useEntuAuth', () => ({
  token: mockToken
}))

vi.stubGlobal('useEntuApi', () => ({
  updateEntity: mockUpdateEntity
}))

// Mock global fetch for uploadFileToUrl (uses fetch, not $fetch)
const mockGlobalFetch = vi.fn()
vi.stubGlobal('fetch', mockGlobalFetch)

// Helper to create mock File objects
const createMockFile = (name: string, size: number, type: string): File => {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

describe('useClientSideFileUpload', () => {
  let composable: Awaited<ReturnType<typeof getComposable>>

  async function getComposable () {
    vi.resetModules()
    // Re-stub after resetModules
    vi.stubGlobal('useClientLogger', () => ({
      debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()
    }))
    vi.stubGlobal('useNuxtApp', () => ({
      $fetch: mockFetchFn,
      $config: { public: { F015_CLIENT_SIDE_FILE_UPLOAD: mockFeatureFlag } }
    }))
    vi.stubGlobal('useEntuAuth', () => ({ token: mockToken }))
    vi.stubGlobal('useEntuApi', () => ({ updateEntity: mockUpdateEntity }))
    vi.stubGlobal('fetch', mockGlobalFetch)

    const mod = await import('../../app/composables/useClientSideFileUpload')
    return mod.useClientSideFileUpload()
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockToken.value = 'test-token'
    mockFeatureFlag = 'false'
    composable = await getComposable()
  })

  describe('validateFile', () => {
    it('should accept valid JPEG file', () => {
      const file = createMockFile('photo.jpg', 1024 * 1024, 'image/jpeg')
      const result = composable.validateFile(file)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid PNG file', () => {
      const file = createMockFile('screenshot.png', 500 * 1024, 'image/png')
      expect(composable.validateFile(file).isValid).toBe(true)
    })

    it('should accept valid GIF file', () => {
      const file = createMockFile('animation.gif', 200 * 1024, 'image/gif')
      expect(composable.validateFile(file).isValid).toBe(true)
    })

    it('should accept valid WebP file', () => {
      const file = createMockFile('image.webp', 200 * 1024, 'image/webp')
      expect(composable.validateFile(file).isValid).toBe(true)
    })

    it('should accept file at exactly 10MB', () => {
      const file = createMockFile('exact.jpg', 10 * 1024 * 1024, 'image/jpeg')
      expect(composable.validateFile(file).isValid).toBe(true)
    })

    it('should reject file exceeding 10MB', () => {
      const file = createMockFile('huge.jpg', 15 * 1024 * 1024, 'image/jpeg')
      const result = composable.validateFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File too large')
    })

    it('should reject non-image file types', () => {
      const file = createMockFile('document.pdf', 1024, 'application/pdf')
      const result = composable.validateFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File type not allowed')
    })

    it('should reject empty files (size 0)', () => {
      const file = createMockFile('empty.jpg', 0, 'image/jpeg')
      const result = composable.validateFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File data is empty')
    })

    it('should accept file with no MIME type (unknown type)', () => {
      const file = createMockFile('photo.jpg', 1024, '')
      expect(composable.validateFile(file).isValid).toBe(true)
    })
  })

  describe('isClientSideUploadEnabled', () => {
    it('should return false when feature flag is false', () => {
      expect(composable.isClientSideUploadEnabled()).toBe(false)
    })

    it('should return true when feature flag is true', async () => {
      mockFeatureFlag = 'true'
      composable = await getComposable()
      expect(composable.isClientSideUploadEnabled()).toBe(true)
    })
  })

  describe('getFileUploadUrl', () => {
    it('should call updateEntity with photo properties and return upload info', async () => {
      const uploadInfo = { url: 'https://storage.example.com/upload', headers: { 'x-amz-acl': 'public-read' } }
      mockUpdateEntity.mockResolvedValueOnce({
        properties: [{ upload: uploadInfo }]
      })

      const result = await composable.getFileUploadUrl('entity-123', {
        filename: 'photo.jpg',
        filesize: 1024,
        filetype: 'image/jpeg'
      })

      expect(mockUpdateEntity).toHaveBeenCalledWith('entity-123', [{
        type: 'photo',
        filename: 'photo.jpg',
        filesize: 1024,
        filetype: 'image/jpeg'
      }])
      expect(result.url).toBe('https://storage.example.com/upload')
      expect(result.headers).toEqual({ 'x-amz-acl': 'public-read' })
    })

    it('should throw when not authenticated', async () => {
      mockToken.value = null
      composable = await getComposable()

      await expect(composable.getFileUploadUrl('entity-123', {
        filename: 'photo.jpg', filesize: 1024, filetype: 'image/jpeg'
      })).rejects.toThrow('Not authenticated')
    })

    it('should throw when no upload info in response', async () => {
      mockUpdateEntity.mockResolvedValueOnce({ properties: [{}] })

      await expect(composable.getFileUploadUrl('entity-123', {
        filename: 'photo.jpg', filesize: 1024, filetype: 'image/jpeg'
      })).rejects.toThrow('Failed to get upload URL')
    })

    it('should throw when API call fails', async () => {
      mockUpdateEntity.mockRejectedValueOnce(new Error('Network error'))

      await expect(composable.getFileUploadUrl('entity-123', {
        filename: 'photo.jpg', filesize: 1024, filetype: 'image/jpeg'
      })).rejects.toThrow('Failed to get upload URL: Network error')
    })
  })

  describe('uploadFileToUrl', () => {
    it('should send file via proxy and return response on success', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true })
      }
      mockGlobalFetch.mockResolvedValueOnce(mockResponse)

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      const result = await composable.uploadFileToUrl(file, 'https://storage.example.com/upload', { 'x-amz-acl': 'public-read' })

      expect(mockGlobalFetch).toHaveBeenCalledWith('/api/upload-proxy', expect.objectContaining({
        method: 'POST'
      }))
      expect(result).toBe(mockResponse)
    })

    it('should throw when proxy returns non-ok response', async () => {
      mockGlobalFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Gateway',
        json: () => Promise.resolve({ error: 'Storage unavailable' })
      })

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      await expect(composable.uploadFileToUrl(file, 'https://example.com/upload'))
        .rejects.toThrow('Upload proxy failed: Storage unavailable')
    })

    it('should handle non-JSON error response from proxy', async () => {
      mockGlobalFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('not json'))
      })

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      await expect(composable.uploadFileToUrl(file, 'https://example.com/upload'))
        .rejects.toThrow('Upload proxy failed: Unknown error')
    })

    it('should throw when result.success is false', async () => {
      mockGlobalFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Upload rejected' })
      })

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      await expect(composable.uploadFileToUrl(file, 'https://example.com/upload'))
        .rejects.toThrow('File upload failed: Upload rejected')
    })
  })

  describe('uploadFiles (client-side)', () => {
    it('should return empty array for no files', async () => {
      const result = await composable.uploadFiles('entity-123', [])
      expect(result).toEqual([])
    })

    it('should throw when not authenticated', async () => {
      mockToken.value = null
      composable = await getComposable()
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')

      await expect(composable.uploadFiles('entity-123', [file]))
        .rejects.toThrow('Not authenticated')
    })

    it('should upload valid file and return success result', async () => {
      mockUpdateEntity.mockResolvedValueOnce({
        properties: [{ upload: { url: 'https://storage.example.com/upload', headers: {} } }]
      })
      mockGlobalFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      const results = await composable.uploadFiles('entity-123', [file])

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        filename: 'photo.jpg',
        success: true,
        entityId: 'entity-123',
        size: 1024,
        type: 'image/jpeg'
      })
    })

    it('should include validation failure in results without throwing', async () => {
      const bigFile = createMockFile('huge.jpg', 15 * 1024 * 1024, 'image/jpeg')
      const results = await composable.uploadFiles('entity-123', [bigFile])

      expect(results).toHaveLength(1)
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toContain('File too large')
    })

    it('should handle upload error and continue with next file', async () => {
      // First file: upload URL fails
      mockUpdateEntity.mockRejectedValueOnce(new Error('API down'))
      // Second file: succeeds
      mockUpdateEntity.mockResolvedValueOnce({
        properties: [{ upload: { url: 'https://storage.example.com/upload', headers: {} } }]
      })
      mockGlobalFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      const file1 = createMockFile('photo1.jpg', 1024, 'image/jpeg')
      const file2 = createMockFile('photo2.jpg', 2048, 'image/png')
      const results = await composable.uploadFiles('entity-123', [file1, file2])

      expect(results).toHaveLength(2)
      expect(results[0]!.success).toBe(false)
      expect(results[0]!.error).toContain('API down')
      expect(results[1]!.success).toBe(true)
    })

    it('should call progress callback at each stage', async () => {
      mockUpdateEntity.mockResolvedValueOnce({
        properties: [{ upload: { url: 'https://storage.example.com/upload', headers: {} } }]
      })
      mockGlobalFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      const progressCallback = vi.fn()
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      await composable.uploadFiles('entity-123', [file], progressCallback)

      expect(progressCallback).toHaveBeenCalledWith(0, 'validating', 10)
      expect(progressCallback).toHaveBeenCalledWith(0, 'getting_upload_url', 25)
      expect(progressCallback).toHaveBeenCalledWith(0, 'uploading', 50)
      expect(progressCallback).toHaveBeenCalledWith(0, 'completed', 100)
    })

    it('should call progress callback with error on failure', async () => {
      mockUpdateEntity.mockRejectedValueOnce(new Error('fail'))

      const progressCallback = vi.fn()
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      await composable.uploadFiles('entity-123', [file], progressCallback)

      expect(progressCallback).toHaveBeenCalledWith(0, 'error', 0)
    })
  })

  describe('uploadFilesServerSide', () => {
    it('should return empty array for no files', async () => {
      const result = await composable.uploadFilesServerSide('entity-123', [])
      expect(result).toEqual([])
    })

    it('should throw when not authenticated', async () => {
      mockToken.value = null
      composable = await getComposable()
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')

      await expect(composable.uploadFilesServerSide('entity-123', [file]))
        .rejects.toThrow('Not authenticated')
    })

    it('should call $fetch with FormData and auth header', async () => {
      mockFetchFn.mockResolvedValueOnce({
        data: {
          uploads: [{ filename: 'photo.jpg', success: true, entityId: 'entity-456' }]
        }
      })

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      const results = await composable.uploadFilesServerSide('entity-123', [file])

      expect(mockFetchFn).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-token' }
      }))
      expect(results).toEqual([{ filename: 'photo.jpg', success: true, entityId: 'entity-456' }])
    })
  })

  describe('upload (feature flag routing)', () => {
    it('should use server-side upload when feature flag is disabled', async () => {
      mockFeatureFlag = 'false'
      composable = await getComposable()

      mockFetchFn.mockResolvedValueOnce({
        data: { uploads: [{ filename: 'photo.jpg', success: true }] }
      })

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      await composable.upload('entity-123', [file])

      // Should call $fetch (server-side), not global fetch (client-side proxy)
      expect(mockFetchFn).toHaveBeenCalled()
      expect(mockGlobalFetch).not.toHaveBeenCalled()
    })

    it('should use client-side upload when feature flag is enabled', async () => {
      mockFeatureFlag = 'true'
      composable = await getComposable()

      mockUpdateEntity.mockResolvedValueOnce({
        properties: [{ upload: { url: 'https://storage.example.com/upload', headers: {} } }]
      })
      mockGlobalFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      await composable.upload('entity-123', [file])

      // Should call updateEntity (client-side) and global fetch (proxy)
      expect(mockUpdateEntity).toHaveBeenCalled()
      expect(mockGlobalFetch).toHaveBeenCalled()
      // Should NOT call $fetch (server-side)
      expect(mockFetchFn).not.toHaveBeenCalled()
    })
  })
})
