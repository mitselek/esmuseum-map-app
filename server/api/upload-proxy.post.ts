import { defineEventHandler, readMultipartFormData } from 'h3'

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
    let file: any = null
    let uploadUrl: string = ''
    let headers: any = {}

    for (const field of formData) {
      if (field.name === 'file' && field.data) {
        file = field
      } else if (field.name === 'uploadUrl' && field.data) {
        uploadUrl = field.data.toString()
      } else if (field.name === 'headers' && field.data) {
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
    } catch (urlError: any) {
      console.error('F015: Invalid upload URL:', urlError.message)
      throw new Error(`Invalid upload URL: ${urlError.message}`)
    }

    console.log('F015: Upload proxy - uploading file:', {
      filename: file.filename,
      size: file.data.length
    })

    // Upload file to DigitalOcean using Entu's signed URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: headers,
      body: file.data
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

  } catch (error: any) {
    console.error('F015: Upload proxy error:', error)
    
    return {
      success: false,
      message: 'Upload proxy failed',
      error: error.message
    }
  }
})