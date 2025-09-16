/**
 * Server-side OAuth callback handler
 * 
 * This endpoint receives the OAuth callback from Entu with a JWT token
 * that has the server's IP as the audience. It validates the token and
 * creates a server-side session for the user.
 */

import { createLogger } from '../../utils/logger'

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
    // But first, we need to exchange the temporary token for a full token
    let user: any
    let authData: any
    try {
      // Exchange the temporary token for a full authentication token
      const config = useRuntimeConfig()
      const apiUrl = config.public.entuUrl || 'https://entu.app'
      const accountName = config.public.entuAccount || 'esmuuseum'
      
      logger.info('Exchanging temporary token for full auth token')
      
      // Debug the token exchange request
      logger.info('Token exchange request details', {
        url: `${apiUrl}/api/auth?account=${accountName}`,
        tempTokenLength: tempToken.length,
        tempTokenPrefix: tempToken.substring(0, 50) + '...',
        headers: {
          'Authorization': `Bearer ${tempToken.substring(0, 20)}...`,
          'Accept-Encoding': 'deflate'
        }
      })
      
      const authResponse = await fetch(`${apiUrl}/api/auth?account=${accountName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tempToken}`,
          'Accept-Encoding': 'deflate'
        }
      })
      
      // Debug the response before parsing
      logger.info('Token exchange response details', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        headers: Object.fromEntries(authResponse.headers.entries()),
        url: authResponse.url
      })
      
      if (!authResponse.ok) {
        throw new Error(`Token exchange failed: ${authResponse.status} ${authResponse.statusText}`)
      }
      
      authData = await authResponse.json()
      logger.info('Token exchange successful', { 
        hasUser: !!authData.user,
        hasToken: !!authData.token,
        accounts: authData.accounts?.length || 0
      })
      
      // Debug: Log the structure of the auth response
      logger.info('Token exchange response structure', {
        responseKeys: Object.keys(authData),
        userKeys: authData.user ? Object.keys(authData.user) : [],
        accountsStructure: authData.accounts ? authData.accounts.map((acc: any) => Object.keys(acc)) : [],
        fullResponse: JSON.stringify(authData).substring(0, 1000)
      })
      
      // Use the user data directly from the token exchange response
      if (!authData.user) {
        throw new Error('No user info in token exchange response')
      }
      
      // Create user object from the token exchange response
      user = { ...authData.user }
      
      // Add user ID from accounts if available (same pattern as client-side auth)
      if (authData.accounts && authData.accounts.length > 0 && authData.accounts[0].user && authData.accounts[0].user._id) {
        user._id = authData.accounts[0].user._id
      }
      
      logger.info('User authenticated from token exchange', { 
        userId: user._id,
        userEmail: user.email,
        userName: user.name
      })
      
    } catch (tokenExchangeError: any) {
      logger.error('Token exchange failed', tokenExchangeError)
      throw tokenExchangeError
    }
    
    logger.info('Authentication successful', { userId: user._id })
    
    // Create a server-side session
    // Store both user data and the JWT token for API calls
    const sessionToken = await generateSessionToken(user, authData.token)
    
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
async function generateSessionToken(user: any, jwtToken: string): Promise<string> {
  // For now, we'll use a simple base64 encoded user info
  // In production, you should sign this or store it in a secure session store
  const sessionData = {
    userId: user._id,
    email: user.email,
    name: user.name,
    jwtToken: jwtToken, // Store the JWT token for API calls
    created: Date.now(),
    expires: Date.now() + (60 * 60 * 24 * 7 * 1000) // 7 days
  }
  
  return Buffer.from(JSON.stringify(sessionData)).toString('base64')
}