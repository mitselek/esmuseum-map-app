/**
 * Server-side OAuth initiation endpoint
 *
 * This endpoint starts the OAuth flow from the server side, ensuring that
 * Entu sees the server's IP address as the audience, not the client's IP.
 */

import { createLogger } from '../../utils/logger'

const logger = createLogger('auth-start')

export default defineEventHandler(async (event) => {
  logger.info('Starting server-side OAuth flow')

  try {
    const body = await readBody(event)
    const { provider } = body

    // Validate provider
    const validProviders = ['google', 'apple', 'smart-id', 'mobile-id', 'id-card']
    if (!provider || !validProviders.includes(provider)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid authentication provider'
      })
    }

    // Get runtime config
    const config = useRuntimeConfig()
    const apiUrl = config.public.entuUrl || 'https://entu.app'
    const accountName = config.public.entuAccount || 'esmuuseum'

    // Build callback URL - this will be our server endpoint
    const baseUrl = getRequestURL(event)
    const callbackUrl = `${baseUrl.protocol}//${baseUrl.host}/api/auth/callback?jwt=`

    // Store the original client URL for redirect after successful auth
    const clientRedirectUrl = body.redirectUrl || '/'

    // Build the OAuth URL
    const callback = encodeURIComponent(callbackUrl)
    const authUrl = `${apiUrl}/api/auth/${provider}?account=${accountName}&next=${callback}`

    logger.info('OAuth flow details', {
      provider,
      authUrl,
      callbackUrl,
      clientRedirectUrl
    })

    // Return the auth URL for the client to redirect to
    return {
      success: true,
      authUrl,
      callbackUrl,
      provider
    }
  }
  catch (error: any) {
    logger.error('Failed to start OAuth flow', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to start OAuth flow'
    })
  }
})
