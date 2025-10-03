/**
 * F015 Client-Side File Upload Implementation
 *
 * Migrates file upload from server-side proxy to direct client-side Entu API calls
 *
 * Flow:
 * 1. Validate files client-side
 * 2. Call Entu API to get upload URL (POST /entity/{id} with file metadata)
 * 3. Upload file directly to external storage using provided URL
 * 4. Return upload results
 */

export const useClientSideFileUpload = () => {
  const { $fetch } = useNuxtApp()
  const { token } = useEntuAuth()
  const { updateEntity } = useEntuApi() // Fix: use updateEntity instead of postEntity

  // File validation constants (matching server-side)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  ]

  /**
   * Feature flag check for F015 client-side file upload
   */
  const isClientSideUploadEnabled = () => {
    const { $config } = useNuxtApp()
    return $config?.public?.F015_CLIENT_SIDE_FILE_UPLOAD === 'true'
  }

  /**
   * Validate uploaded file
   */
  const validateFile = (file) => {
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

  /**
   * Get upload URL from Entu API by adding photo property to entity
   */
  const getFileUploadUrl = async (entityId, fileInfo) => {
    if (!token.value) {
      throw new Error('Not authenticated')
    }

    try {
      const properties = [{
        type: 'photo',
        filename: fileInfo.filename,
        filesize: fileInfo.filesize,
        filetype: fileInfo.filetype
      }]

      const response = await updateEntity(entityId, properties)

      // Extract upload information from response
      if (!response?.properties?.[0]?.upload) {
        throw new Error('No upload information received from Entu API')
      }

      const uploadInfo = response.properties[0].upload

      return uploadInfo
    }
    catch (error) {
      console.error('F015: Failed to get upload URL:', error)
      throw new Error(`Failed to get upload URL: ${error.message}`)
    }
  }

  /**
   * Upload file to external storage using provided URL
   */
  async function uploadFileToUrl (file, uploadUrl, headers = {}) {
    // F015 Phase 3.2b: Use upload proxy to avoid CORS issues
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploadUrl', uploadUrl)
    formData.append('headers', JSON.stringify(headers))

    const response = await fetch('/api/upload-proxy', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Upload proxy failed: ${errorData.error || response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(`File upload failed: ${result.error || result.message}`)
    }

    return response
  }

  /**
   * Client-side file upload implementation
   * Processes multiple files and uploads them directly to Entu
   */
  const uploadFiles = async (parentEntityId, files, progressCallback) => {
    if (!files || files.length === 0) {
      return []
    }

    if (!token.value) {
      throw new Error('Not authenticated')
    }

    const uploadResults = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        // Update progress
        if (progressCallback) {
          progressCallback(i, 'validating', 10)
        }

        // Validate file
        const validation = validateFile(file)
        if (!validation.isValid) {
          uploadResults.push({
            filename: file.name,
            success: false,
            error: validation.error
          })
          continue
        }

        // Update progress
        if (progressCallback) {
          progressCallback(i, 'getting_upload_url', 25)
        }

        // Step 1: Get upload URL from Entu
        const uploadInfo = await getFileUploadUrl(parentEntityId, {
          filename: file.name,
          filesize: file.size,
          filetype: file.type || 'application/octet-stream'
        })

        // Update progress
        if (progressCallback) {
          progressCallback(i, 'uploading', 50)
        }

        // Step 2: Upload file to external storage
        await uploadFileToUrl(
          file,
          uploadInfo.url,
          uploadInfo.headers || {}
        )

        // Update progress
        if (progressCallback) {
          progressCallback(i, 'completed', 100)
        }

        uploadResults.push({
          filename: file.name,
          success: true,
          entityId: parentEntityId,
          size: file.size,
          type: file.type
        })
      }
      catch (error) {
        console.error(`F015: Failed to upload file ${file.name}:`, error)

        if (progressCallback) {
          progressCallback(i, 'error', 0)
        }

        uploadResults.push({
          filename: file.name,
          success: false,
          error: error.message || 'Upload failed'
        })
      }
    }

    return uploadResults
  }

  /**
   * Server-side fallback upload (current implementation)
   */
  const uploadFilesServerSide = async (parentEntityId, files) => {
    if (!files || files.length === 0) {
      return []
    }

    if (!token.value) {
      throw new Error('Not authenticated')
    }

    // Create FormData
    const formData = new FormData()
    formData.append('parentEntityId', parentEntityId)

    files.forEach((file) => {
      formData.append('file', file)
    })

    // Upload via server API
    const { data } = await $fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: formData
    })

    return data.uploads || []
  }

  /**
   * Main upload function with feature flag routing
   */
  const upload = async (parentEntityId, files, progressCallback) => {
    if (isClientSideUploadEnabled()) {
      return await uploadFiles(parentEntityId, files, progressCallback)
    }
    else {
      return await uploadFilesServerSide(parentEntityId, files)
    }
  }

  return {
    // Main interface
    upload,
    uploadFiles, // Direct client-side upload
    uploadFilesServerSide, // Fallback

    // Utilities
    validateFile,
    isClientSideUploadEnabled,

    // Advanced (for testing/debugging)
    getFileUploadUrl,
    uploadFileToUrl
  }
}
