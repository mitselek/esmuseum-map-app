/**
 * F020: Webhook validation utilities
 * 
 * Security and validation helpers for webhook endpoints
 */

import { createLogger } from './logger'
import type { H3Event } from 'h3'

const logger = createLogger('webhook-validation')

/**
 * Validate webhook request authenticity
 * 
 * Current implementation is basic - will be enhanced when we receive
 * actual webhook payloads from Entu and understand their authentication
 * 
 * @param event - H3 event object
 * @returns Boolean indicating if webhook is valid
 */
export function validateWebhookRequest(event: H3Event): boolean {
  const config = useRuntimeConfig()
  const webhookSecret = config.webhookSecret as string | undefined

  // If no secret is configured, log warning but allow (for initial testing)
  if (!webhookSecret) {
    logger.warn('NUXT_WEBHOOK_SECRET not configured - webhook validation disabled')
    return true
  }

  // Check for webhook signature/token in headers
  // This will be implemented once we know what Entu sends
  const signature = getHeader(event, 'x-webhook-signature')
  const token = getHeader(event, 'x-webhook-token')

  if (!signature && !token) {
    logger.warn('Webhook request missing authentication headers')
    return false
  }

  // TODO: Implement actual signature validation once we know Entu's format
  // For now, just check if secret matches token (placeholder)
  if (token && token === webhookSecret) {
    return true
  }

  logger.warn('Webhook authentication failed')
  return false
}

/**
 * Validate webhook payload structure
 * 
 * Ensures the payload has required fields before processing
 * Entu webhook format: { db, plugin, entity: { _id }, token: "jwt..." }
 * 
 * @param payload - The webhook payload to validate
 * @returns Validation result with errors if any
 */
export function validateWebhookPayload(
  payload: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for basic structure
  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object')
    return { valid: false, errors }
  }

  // Validate Entu webhook format
  if (!payload.db) {
    errors.push('Missing db field in payload')
  }

  if (!payload.entity || typeof payload.entity !== 'object') {
    errors.push('Missing entity object in payload')
  } else if (!payload.entity._id) {
    errors.push('Missing entity._id in payload')
  }

  if (!payload.token || typeof payload.token !== 'string') {
    errors.push('Missing token field in payload')
  }

  const valid = errors.length === 0

  if (!valid) {
    logger.warn('Webhook payload validation failed', { errors, payload })
  }

  return { valid, errors }
}

/**
 * Extract entity ID from webhook payload
 * 
 * Entu webhook format: { entity: { _id: "..." } }
 * We'll need to fetch the full entity to determine what changed
 * 
 * @param payload - The webhook payload
 * @returns Extracted entity ID
 */
export function extractEntityId(payload: any): string | null {
  const entityId = payload.entity?._id || null

  logger.debug('Extracted entity ID from payload', { entityId })

  return entityId
}

/**
 * Extract user JWT token from webhook payload
 * 
 * Entu webhook format: { token: "eyJhbGci..." }
 * The token contains user information and can be used to make API calls
 * 
 * @param payload - The webhook payload
 * @returns Extracted JWT token and decoded user info
 */
export function extractUserToken(payload: any): { 
  token: string | null
  userId: string | null
  userEmail: string | null
} {
  const token = payload.token || null

  if (!token) {
    logger.warn('No token found in webhook payload')
    return { token: null, userId: null, userEmail: null }
  }

  // Decode JWT to get user info (without verification - Entu already validated it)
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      logger.warn('Invalid JWT token format')
      return { token, userId: null, userEmail: null }
    }

    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    const userId = payload.accounts?.[payload.db] || payload.accounts?.esmuuseum || null
    const userEmail = payload.user?.email || null

    logger.info('Extracted user token from webhook', {
      userId,
      userEmail,
      tokenExpiry: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown'
    })

    return { token, userId, userEmail }
  } catch (error: any) {
    logger.error('Failed to decode JWT token', { error: error.message })
    return { token, userId: null, userEmail: null }
  }
}

/**
 * Rate limiting check (simple in-memory implementation)
 * 
 * Prevents webhook spam by tracking request frequency per IP
 * 
 * @param event - H3 event object
 * @param maxRequests - Maximum requests allowed in time window
 * @param windowMs - Time window in milliseconds
 * @returns Boolean indicating if request should be allowed
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  event: H3Event,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  // Get client IP
  const ip = getHeader(event, 'x-forwarded-for') || 
             getHeader(event, 'x-real-ip') || 
             'unknown'

  const now = Date.now()
  const record = requestCounts.get(ip)

  // Clean up old records
  if (record && now > record.resetAt) {
    requestCounts.delete(ip)
  }

  // Check if rate limit exceeded
  if (record && now <= record.resetAt) {
    if (record.count >= maxRequests) {
      logger.warn('Rate limit exceeded', {
        ip,
        count: record.count,
        maxRequests,
        windowMs
      })
      return false
    }
    record.count++
  } else {
    // New window
    requestCounts.set(ip, {
      count: 1,
      resetAt: now + windowMs
    })
  }

  return true
}

/**
 * Sanitize and log webhook payload safely
 * 
 * Removes sensitive data before logging
 * 
 * @param payload - The payload to sanitize
 * @returns Sanitized payload safe for logging
 */
export function sanitizePayloadForLogging(payload: any): any {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  // Create shallow copy
  const sanitized = { ...payload }

  // Remove potentially sensitive fields
  const sensitiveFields = ['token', 'api_key', 'apiKey', 'secret', 'password']
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***'
    }
  }

  return sanitized
}
