/**
 * Check authentication status for server-side auth
 *
 * This endpoint checks if the user has a valid server-side session
 * and returns the user information if authenticated.
 */

import { createLogger } from '../../utils/logger'

const logger = createLogger('auth-status')

export default defineEventHandler(async (event) => {
  try {
    // Get the session cookie
    const sessionToken = getCookie(event, 'auth-session')

    if (!sessionToken) {
      return {
        authenticated: false,
        user: null
      }
    }

    // Decode the session token
    const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString())

    // Check if session has expired
    if (sessionData.expires < Date.now()) {
      logger.info('Session expired')

      // Clear the expired cookie
      deleteCookie(event, 'auth-session')

      return {
        authenticated: false,
        user: null,
        error: 'Session expired'
      }
    }

    logger.debug('Session is valid', { userId: sessionData.userId })

    return {
      authenticated: true,
      user: {
        _id: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name
      }
    }
  }
  catch (error: any) {
    logger.error('Failed to check auth status', error)

    // Clear invalid cookie
    deleteCookie(event, 'auth-session')

    return {
      authenticated: false,
      user: null,
      error: 'Invalid session'
    }
  }
})
