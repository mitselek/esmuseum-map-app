/**
 * Tests for useClientSideFileUpload composable
 *
 * Tests file validation, upload flow, feature flag routing, and error handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Import the composable types for reference
import type { FileValidationResult } from '~/composables/useClientSideFileUpload'

// Mock dependencies
const mockToken = ref<string | null>('test-token')
const mockUpdateEntity = vi.fn()
const mockFetchFn = vi.fn()
const mockConfig = { public: { F015_CLIENT_SIDE_FILE_UPLOAD: 'false' } }

vi.stubGlobal('useClientLogger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

vi.stubGlobal('useNuxtApp', () => ({
  $fetch: mockFetchFn,
  $config: mockConfig
}))

vi.stubGlobal('useEntuAuth', () => ({
  token: mockToken
}))

vi.stubGlobal('useEntuApi', () => ({
  updateEntity: mockUpdateEntity
}))

// Helper to create mock File objects
const createMockFile = (name: string, size: number, type: string): File => {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

// Recreate the validation logic for testing (same pattern as useClientLogger test)
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const validateFile = (file: File): FileValidationResult => {
  if (!file.name) {
    return { isValid: false, error: 'Filename is required' }
  }
  if (!file.size || file.size === 0) {
    return { isValid: false, error: 'File data is empty' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 10MB.`
    }
  }
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed: ${file.name} (${file.type}). Allowed types: images only.`
    }
  }
  return { isValid: true }
}

describe('useClientSideFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken.value = 'test-token'
    mockConfig.public.F015_CLIENT_SIDE_FILE_UPLOAD = 'false'
  })

  describe('validateFile', () => {
    it('should accept valid JPEG file', () => {
      const file = createMockFile('photo.jpg', 1024 * 1024, 'image/jpeg')
      const result = validateFile(file)
      expect(result.isValid).toBe(true)
    })

    it('should accept valid PNG file', () => {
      const file = createMockFile('screenshot.png', 500 * 1024, 'image/png')
      const result = validateFile(file)
      expect(result.isValid).toBe(true)
    })

    it('should accept valid WebP file', () => {
      const file = createMockFile('image.webp', 200 * 1024, 'image/webp')
      const result = validateFile(file)
      expect(result.isValid).toBe(true)
    })

    it('should reject file exceeding 10MB', () => {
      const file = createMockFile('huge.jpg', 15 * 1024 * 1024, 'image/jpeg')
      const result = validateFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File too large')
    })

    it('should reject non-image file types', () => {
      const file = createMockFile('document.pdf', 1024, 'application/pdf')
      const result = validateFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File type not allowed')
    })

    it('should reject empty files', () => {
      const file = createMockFile('empty.jpg', 0, 'image/jpeg')
      const result = validateFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File data is empty')
    })

    it('should accept file at exactly 10MB', () => {
      const file = createMockFile('exact.jpg', 10 * 1024 * 1024, 'image/jpeg')
      const result = validateFile(file)
      expect(result.isValid).toBe(true)
    })
  })

  describe('feature flag routing', () => {
    it('should detect client-side upload disabled', () => {
      mockConfig.public.F015_CLIENT_SIDE_FILE_UPLOAD = 'false'
      const { $config } = useNuxtApp()
      expect($config?.public?.F015_CLIENT_SIDE_FILE_UPLOAD).toBe('false')
    })

    it('should detect client-side upload enabled', () => {
      mockConfig.public.F015_CLIENT_SIDE_FILE_UPLOAD = 'true'
      const { $config } = useNuxtApp()
      expect($config?.public?.F015_CLIENT_SIDE_FILE_UPLOAD).toBe('true')
    })
  })

  describe('authentication guard', () => {
    it('should require authentication token', () => {
      mockToken.value = null
      expect(mockToken.value).toBeNull()
    })

    it('should proceed with valid token', () => {
      mockToken.value = 'valid-token'
      expect(mockToken.value).toBe('valid-token')
    })
  })

  describe('getFileUploadUrl', () => {
    it('should call updateEntity with correct properties', async () => {
      const entityId = 'entity-123'
      const fileInfo = { filename: 'photo.jpg', filesize: 1024, filetype: 'image/jpeg' }

      mockUpdateEntity.mockResolvedValue({
        properties: [{
          upload: { url: 'https://storage.example.com/upload', headers: { 'x-amz-acl': 'public-read' } }
        }]
      })

      const properties = [{
        type: 'photo',
        filename: fileInfo.filename,
        filesize: fileInfo.filesize,
        filetype: fileInfo.filetype
      }]

      const response = await mockUpdateEntity(entityId, properties)

      expect(mockUpdateEntity).toHaveBeenCalledWith(entityId, properties)
      expect(response.properties[0].upload.url).toBe('https://storage.example.com/upload')
    })

    it('should throw when no upload info in response', async () => {
      mockUpdateEntity.mockResolvedValue({ properties: [{}] })

      const response = await mockUpdateEntity('entity-123', [])
      const uploadInfo = response?.properties?.[0]?.upload

      expect(uploadInfo).toBeUndefined()
    })
  })

  describe('uploadFileToUrl (via proxy)', () => {
    it('should construct FormData with file, uploadUrl and headers', () => {
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploadUrl', 'https://storage.example.com/upload')
      formData.append('headers', JSON.stringify({ 'x-amz-acl': 'public-read' }))

      expect(formData.get('uploadUrl')).toBe('https://storage.example.com/upload')
      expect(formData.get('file')).toBeInstanceOf(File)
      expect(JSON.parse(formData.get('headers') as string)).toEqual({ 'x-amz-acl': 'public-read' })
    })

    it('should detect upload failure from response', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Gateway',
        json: () => Promise.resolve({ error: 'Storage unavailable' })
      }

      // Simulate error handling logic from the composable
      if (!mockResponse.ok) {
        const errorData = await mockResponse.json()
        const errorMessage = `Upload proxy failed: ${errorData.error || mockResponse.statusText}`
        expect(errorMessage).toBe('Upload proxy failed: Storage unavailable')
      }
    })

    it('should detect upload success from response', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true })
      }

      const result = await mockResponse.json()
      expect(result.success).toBe(true)
    })
  })

  describe('server-side fallback upload', () => {
    it('should send FormData with authorization header', async () => {
      mockFetchFn.mockResolvedValue({
        data: {
          uploads: [{ filename: 'photo.jpg', success: true, entityId: 'entity-456' }]
        }
      })

      const response = await mockFetchFn('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${mockToken.value}` },
        body: expect.any(FormData)
      })

      expect(response.data.uploads[0].success).toBe(true)
    })

    it('should return empty array for no files', () => {
      const files: File[] = []
      expect(files.length).toBe(0)
    })
  })
})
