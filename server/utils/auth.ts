/**
 * Server-side authentication utilities
 * Handles token validation and user authentication
 */

import { callEntuApi, getEntuEntity, getEntuApiConfig } from './entu'
import type { EntuApiOptions } from './entu'
import { createLogger } from './logger'

// Create a logger for this module
const logger = createLogger('auth')

export interface AuthenticatedUser {
  _id: string
  email: string
  name?: string
  groups?: string[]
}

/**
 * Extract and validate Bearer token from Authorization header
 */
export function extractBearerToken (event: any): string {
  logger.debug('Extracting bearer token from request')

  const authHeader = getHeader(event, 'authorization')

  if (!authHeader) {
    logger.warn('No Authorization header found in request')
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required'
    })
  }

  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Invalid Authorization header format')
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header must be in Bearer format'
    })
  }

  const token = authHeader.substring(7).trim()

  if (!token) {
    logger.warn('Empty Bearer token')
    throw createError({
      statusCode: 401,
      statusMessage: 'Bearer token is required'
    })
  }

  logger.debug(`Token extracted successfully (length: ${token.length})`)
  return token
}

/**
 * Validate token and get user info from Entu
 * Optimized: Use JWT token directly instead of making API calls
 */
export async function authenticateUser (event: any): Promise<AuthenticatedUser> {
  logger.info('Authenticating user request')

  const token = extractBearerToken(event)

  try {
    // JWT tokens have 3 parts: header.payload.signature
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3 || !tokenParts[1]) {
      throw new Error('Invalid JWT token format')
    }

    // Decode the payload (base64)
    const payloadBase64 = tokenParts[1]
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())
    
    logger.debug('JWT token payload', {
      payload: payload,
      hasUser: !!payload.user,
      hasAccounts: !!payload.accounts
    })

    // Validate token hasn't expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('JWT token has expired')
    }

    // Extract user info from JWT payload
    if (!payload.user) {
      throw new Error('No user info in JWT token')
    }

    const user = { ...payload.user }

    // Add user ID from accounts if available
    if (payload.accounts && payload.accounts.esmuuseum) {
      user._id = payload.accounts.esmuuseum
    }

    if (!user._id) {
      throw new Error('No user ID found in JWT token')
    }

    logger.info(`User authenticated from JWT token: ${user.email}`, {
      userId: user._id,
      fromToken: true
    })

    return user as AuthenticatedUser
  }
  catch (error: any) {
    logger.error('JWT authentication failed', error)

    // Fallback to API call only if JWT parsing fails
    logger.debug('Falling back to Entu API authentication')
    return await authenticateUserViaAPI(event, token)
  }
}

/**
 * Fallback: Authenticate via Entu API (slower)
 */
async function authenticateUserViaAPI (event: any, token: string): Promise<AuthenticatedUser> {
  const config = useRuntimeConfig()
  const apiUrl = config.public.entuUrl || 'https://entu.app'
  const accountName = config.public.entuAccount || 'esmuuseum'

  logger.debug('Calling Entu auth endpoint', { url: `${apiUrl}/api/${accountName}` })

  // Call the same endpoint that client uses for auth verification
  const response = await fetch(`${apiUrl}/api/${accountName}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept-Encoding': 'deflate'
    }
  })

  if (!response.ok) {
    logger.warn(`Authentication failed: ${response.status} ${response.statusText}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed'
    })
  }

  const data = await response.json()

  // Debug: Log the actual response structure to understand what we're getting
  logger.debug('Entu auth response structure', {
    hasUser: !!data.user,
    hasAccounts: !!data.accounts,
    dataKeys: Object.keys(data),
    responseType: typeof data,
    sampleData: JSON.stringify(data).substring(0, 500)
  })

  if (!data.user) {
    logger.warn('No user info in authentication response', {
      responseKeys: Object.keys(data),
      fullResponse: data
    })
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authentication response'
    })
  }

  // Match the exact client-side user object structure from useEntuAuth.js
  const user = { ...data.user }

  // Add user ID from the accounts array if available - same as client
  if (data.accounts && data.accounts.length > 0 && data.accounts[0].user && data.accounts[0].user._id) {
    user._id = data.accounts[0].user._id
  }

  logger.info(`User authenticated successfully: ${user.email}`, {
    userId: user._id,
    hasAccounts: data.accounts ? data.accounts.length : 0,
    fromAPI: true
  })

  return user as AuthenticatedUser
}

/**
 * Check if user has permission to access a task
 * User must be in task's _owner, _editor, or _expander properties to create responses
 */
export async function checkTaskPermission (user: AuthenticatedUser, taskId: string, apiConfig: EntuApiOptions): Promise<boolean> {
  logger.debug('Checking task permission', { userId: user._id, taskId })

  try {
    // Get the task entity to check permissions
    const taskResponse = await getEntuEntity(taskId, apiConfig)
    
    if (!taskResponse) {
      logger.warn('Task not found for permission check', { taskId })
      return false
    }

    // Entu returns entities wrapped in an 'entity' property
    const task = taskResponse.entity || taskResponse

    // Check if user is in any of the permission arrays
    const permissionArrays = [
      task._owner || [],
      task._editor || [],
      task._expander || []
    ]

    for (const permissionArray of permissionArrays) {
      if (Array.isArray(permissionArray)) {
        const hasPermission = permissionArray.some((permission: any) => 
          permission.reference === user._id || permission._id === user._id
        )
        if (hasPermission) {
          logger.debug('User has permission on task', { userId: user._id, taskId })
          return true
        }
      }
    }

    logger.warn('User does not have permission on task', { userId: user._id, taskId })
    return false
  } catch (error) {
    logger.error('Error checking task permission', { error, userId: user._id, taskId })
    return false
  }
}

/**
 * Check if user has permission to modify a response
 */
export async function checkResponsePermission (user: AuthenticatedUser, responseId: string, apiConfig: EntuApiOptions): Promise<boolean> {
  logger.debug('Checking response permission', { userId: user._id, responseId })

  try {
    // Get response entity to check ownership
    const response = await getEntuEntity(responseId, apiConfig)

    if (!response) {
      logger.warn('Response not found for permission check', { responseId })
      return false
    }

    // Check if user owns this response
    // This assumes the response has a user field with the user ID
    const responseUserId = response.user?._id || response.userId || response._creator

    const hasPermission = responseUserId === user._id
    logger.debug('Response permission check result', {
      userId: user._id,
      responseId,
      responseUserId,
      hasPermission
    })

    return hasPermission
  }
  catch (error) {
    logger.error('Response permission check failed', { userId: user._id, responseId, error })
    return false
  }
}

/**
 * Middleware wrapper for authenticated routes
 */
export async function withAuth<T> (
  event: any,
  handler: (event: any, user: AuthenticatedUser) => Promise<T>
): Promise<T> {
  logger.debug('Processing authenticated request', { path: getRouterParam(event, 'id') || 'unknown' })

  try {
    const user = await authenticateUser(event)
    logger.debug('Authentication successful, executing handler', { userId: user._id })

    const result = await handler(event, user)
    logger.debug('Handler executed successfully')

    return result
  }
  catch (error) {
    logger.error('Authenticated request failed', error)
    throw error
  }
}
