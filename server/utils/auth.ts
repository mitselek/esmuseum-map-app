/**
 * Server-side authentication utilities
 * Handles token validation and user authentication
 */

import { callEntuApi, getEntuEntity, getEntuApiConfig, type EntuApiOptions } from './entu'
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
export function extractBearerToken(event: any): string {
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
 */
export async function authenticateUser(event: any): Promise<AuthenticatedUser> {
  logger.info('Authenticating user request')
  
  const token = extractBearerToken(event)
  const apiConfig = getEntuApiConfig(token)
  
  logger.debug('API config prepared', { url: apiConfig.apiUrl, account: apiConfig.accountName })

  try {
    // Get current user info from Entu using the token
    logger.debug('Calling Entu API for user info')
    const userInfo = await callEntuApi('/user', {}, apiConfig)
    
    if (!userInfo || !userInfo._id) {
      logger.warn('Invalid or empty user info returned from Entu')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication token'
      })
    }

    logger.info(`User authenticated successfully: ${userInfo.email}`, { 
      userId: userInfo._id,
      hasGroups: userInfo.groups ? userInfo.groups.length > 0 : false 
    })

    // Return standardized user object
    const user = {
      _id: userInfo._id,
      email: userInfo.email || '',
      name: userInfo.name || userInfo.displayname || '',
      groups: userInfo.groups || []
    }
    
    return user
  } catch (error) {
    logger.error('Authentication failed', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed'
    })
  }
}

/**
 * Check if user has permission to access a task
 */
export async function checkTaskPermission(user: AuthenticatedUser, taskId: string, apiConfig: EntuApiOptions): Promise<boolean> {
  logger.debug('Checking task permission', { userId: user._id, taskId })
  
  try {
    // Get task entity to check access permissions
    const task = await getEntuEntity(taskId, apiConfig)
    
    if (!task) {
      logger.warn('Task not found for permission check', { taskId })
      return false
    }

    // Check if user has access to this task
    // This logic should match your current task access rules
    // For now, we'll allow access if user has any groups or if task is public
    if (user.groups && user.groups.length > 0) {
      logger.debug('Task permission granted via user groups', { 
        userId: user._id, 
        groupCount: user.groups.length 
      })
      return true
    }

    logger.debug('Task permission denied - no user groups', { userId: user._id })
    return false
  } catch (error) {
    logger.error('Task permission check failed', { userId: user._id, taskId, error })
    return false
  }
}

/**
 * Check if user has permission to modify a response
 */
export async function checkResponsePermission(user: AuthenticatedUser, responseId: string, apiConfig: EntuApiOptions): Promise<boolean> {
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
  } catch (error) {
    logger.error('Response permission check failed', { userId: user._id, responseId, error })
    return false
  }
}

/**
 * Middleware wrapper for authenticated routes
 */
export async function withAuth<T>(
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
  } catch (error) {
    logger.error('Authenticated request failed', error)
    throw error
  }
}
