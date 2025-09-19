/**
 * Logout endpoint for server-side auth
 *
 * Clears the server-side session cookie
 */

import { createLogger } from '../../utils/logger'

const logger = createLogger('auth-logout')

export default defineEventHandler(async (event) => {
  logger.info('User logout requested')

  try {
    // Clear the session cookie
    deleteCookie(event, 'auth-session', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    })

    logger.info('Session cleared successfully')

    return {
      success: true,
      message: 'Logged out successfully'
    }
  }
  catch (error: any) {
    logger.error('Logout failed', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to logout'
    })
  }
})
