/**
 * Server-side authentication utilities
 * Handles token validation and user authentication
 */

import { callEntuApi, getEntuEntity, getEntuApiConfig, type EntuApiOptions } from './entu'

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
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required'
    })
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header must be in Bearer format'
    })
  }

  const token = authHeader.substring(7).trim()
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Bearer token is required'
    })
  }

  return token
}

/**
 * Validate token and get user info from Entu
 */
export async function authenticateUser(event: any): Promise<AuthenticatedUser> {
  const token = extractBearerToken(event)
  const apiConfig = getEntuApiConfig(token)

  try {
    // Get current user info from Entu using the token
    const userInfo = await callEntuApi('/user', {}, apiConfig)
    
    if (!userInfo || !userInfo._id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication token'
      })
    }

    // Return standardized user object
    return {
      _id: userInfo._id,
      email: userInfo.email || '',
      name: userInfo.name || userInfo.displayname || '',
      groups: userInfo.groups || []
    }
  } catch (error) {
    console.error('Authentication failed:', error)
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
  try {
    // Get task entity to check access permissions
    const task = await getEntuEntity(taskId, apiConfig)
    
    if (!task) {
      return false
    }

    // Check if user has access to this task
    // This logic should match your current task access rules
    // For now, we'll allow access if user has any groups or if task is public
    if (user.groups && user.groups.length > 0) {
      return true
    }

    // Add more specific permission logic here based on your requirements
    return false
  } catch (error) {
    console.error('Permission check failed:', error)
    return false
  }
}

/**
 * Check if user has permission to modify a response
 */
export async function checkResponsePermission(user: AuthenticatedUser, responseId: string, apiConfig: EntuApiOptions): Promise<boolean> {
  try {
    // Get response entity to check ownership
    const response = await getEntuEntity(responseId, apiConfig)
    
    if (!response) {
      return false
    }

    // Check if user owns this response
    // This assumes the response has a user field with the user ID
    const responseUserId = response.user?._id || response.userId || response._creator

    return responseUserId === user._id
  } catch (error) {
    console.error('Response permission check failed:', error)
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
  const user = await authenticateUser(event)
  return handler(event, user)
}
