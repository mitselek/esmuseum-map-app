import { defineEventHandler, readMultipartFormData } from 'h3'
import type { UploadedFile, UploadHeaders } from '../../types/workspace'

/**
 * F015 Phase 3.2b: Upload Proxy Endpoint
 *
 * Hybrid approach:
 * 1. Client gets upload URL from Entu (client-side)
 * 2. Client sends file + upload info to this proxy
 * 3. Server uploads to DigitalOcean using Entu's URL (no CORS)
 * 4. Server returns result to client
 */
export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData) {
      throw new Error('No form data received')
    }

    // Extract file and upload info from form data
    let file: UploadedFile | null = null
    let uploadUrl: string = ''
    let headers: UploadHeaders = {}

    for (const field of formData) {
      if (field.name === 'file' && field.data) {
        file = field
      }
      else if (field.name === 'uploadUrl' && field.data) {
        uploadUrl = field.data.toString()
      }
      else if (field.name === 'headers' && field.data) {
        headers = JSON.parse(field.data.toString())
      }
    }

    if (!file || !uploadUrl) {
      throw new Error('Missing required fields: file and uploadUrl')
    }

    // Validate and sanitize the upload URL
    let validatedUrl: URL
    try {
      validatedUrl = new URL(uploadUrl)
    }
    // Constitutional: Error type is unknown - we catch and validate errors at boundaries
    // Principle I: Type Safety First - documented exception for error handling
    catch (urlError: unknown) {
      const errorMessage = urlError instanceof Error ? urlError.message : 'Invalid URL format'
      console.error('F015: Invalid upload URL:', errorMessage)
      throw new Error(`Invalid upload URL: ${errorMessage}`)
    }

    console.log('F015: Upload proxy - uploading file:', {
      filename: file.filename,
      size: file.data.length
    })

    // Upload file to DigitalOcean using Entu's signed URL
    // Constitutional: Buffer is valid BodyInit in Node.js but TypeScript doesn't recognize it
    // Principle I: Type Safety First - documented exception for Node.js Buffer compatibility
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: headers,
      body: file.data as unknown as BodyInit
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('F015: Upload proxy - DigitalOcean upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText
      })
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }

    console.log('F015: Upload proxy - success:', {
      filename: file.filename,
      status: uploadResponse.status
    })

    return {
      success: true,
      message: 'File uploaded successfully via proxy',
      filename: file.filename,
      size: file.data.length
    }
  }
  // Constitutional: Error type is unknown - we catch and validate errors at boundaries
  // Principle I: Type Safety First - documented exception for error handling
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
    console.error('F015: Upload proxy error:', error)

    return {
      success: false,
      message: 'Upload proxy failed',
      error: errorMessage
    }
  }
})
