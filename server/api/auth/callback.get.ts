/**
 * Server-side OAuth callback handler
 * 
 * This endpoint receives the OAuth callback from Entu with a JWT token
 * that has the server's IP as the audience. It validates the token and
 * creates a server-side session for the user.
 */

import { createLogger } from '../../utils/logger'
import { authenticateUser } from '../../utils/auth'

const logger = createLogger('auth-callback')

export default defineEventHandler(async (event) => {
  logger.info('Processing OAuth callback')
  
  try {
    // Get the JWT token from the URL
    // Entu appends the JWT token to the callback URL
    const url = getRequestURL(event)
    const fullPath = url.pathname
    
    // Extract the JWT token from the path
    const callbackBasePath = '/api/auth/callback'
    let tempToken = fullPath.substring(fullPath.indexOf(callbackBasePath) + callbackBasePath.length)
    
    // Remove leading slash if present
    if (tempToken.startsWith('/')) {
      tempToken = tempToken.substring(1)
    }
    
    // Also check query parameters
    if (!tempToken && url.searchParams.has('jwt')) {
      tempToken = url.searchParams.get('jwt') || ''
    }
    
    if (!tempToken || tempToken.length < 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid JWT token found in callback'
      })
    }
    
    logger.info('Found JWT token in callback', { tokenLength: tempToken.length })
    
    // Debug: Let's decode the JWT to see what's in it
    try {
      const tokenParts = tempToken.split('.')
      if (tokenParts.length === 3 && tokenParts[1]) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
        logger.info('JWT payload debug', {
          payload,
          hasUser: !!payload.user,
          hasAccounts: !!payload.accounts,
          audience: payload.aud,
          subject: payload.sub
        })
      }
    } catch (debugError) {
      logger.warn('Failed to debug JWT payload', debugError)
    }
    
    // Use our existing auth utility to validate the token
    // Since this request is coming from our server, the audience should match
    const mockEvent = {
      node: {
        req: {
          headers: {
            authorization: `Bearer ${tempToken}`
          }
        }
      }
    }
    
    const user = await authenticateUser(mockEvent)
    
    logger.info('Authentication successful', { userId: user._id })
    
    // Create a server-side session
    // For now, we'll use a simple approach with httpOnly cookies
    const sessionToken = await generateSessionToken(user)
    
    // Set httpOnly cookie for session
    setCookie(event, 'auth-session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    logger.info('Session created successfully')
    
    // Redirect to the frontend with success
    // The frontend will detect the session cookie
    const redirectUrl = '/?auth=success'
    
    return sendRedirect(event, redirectUrl)
    
  } catch (error: any) {
    logger.error('OAuth callback failed', error)
    
    // Redirect to frontend with error
    const errorUrl = '/?auth=error&message=' + encodeURIComponent(error.message || 'Authentication failed')
    return sendRedirect(event, errorUrl)
  }
})

/**
 * Generate a session token for the authenticated user
 * This is a simple implementation - in production you might want to use
 * a proper session store or JWT signing
 */
async function generateSessionToken(user: any): Promise<string> {
  // For now, we'll use a simple base64 encoded user info
  // In production, you should sign this or store it in a secure session store
  const sessionData = {
    userId: user._id,
    email: user.email,
    name: user.name,
    created: Date.now(),
    expires: Date.now() + (60 * 60 * 24 * 7 * 1000) // 7 days
  }
  
  return Buffer.from(JSON.stringify(sessionData)).toString('base64')
}