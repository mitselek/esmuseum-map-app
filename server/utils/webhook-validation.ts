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
 * We use JWT token authentication (in webhook payload) instead of webhook secrets.
 *
 * @param event - H3 event object
 * @returns Always returns true (authentication via JWT in payload)
 */
export function validateWebhookRequest (event: H3Event): boolean {
  return true
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
export function validateWebhookPayload (
  payload: unknown
): { valid: boolean, errors: string[] } {
  const errors: string[] = []

  // Check for basic structure
  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object')
    return { valid: false, errors }
  }

  // Constitutional: Webhook payload structure is validated at this boundary
  // Using type assertions after runtime checks
  // Principle I: Type Safety First - documented validation boundary
  const payloadObj = payload as Record<string, unknown>

  // Validate Entu webhook format
  if (!payloadObj.db) {
    errors.push('Missing db field in payload')
  }

  if (!payloadObj.entity || typeof payloadObj.entity !== 'object') {
    errors.push('Missing entity object in payload')
  }
  else {
    const entity = payloadObj.entity as Record<string, unknown>
    if (!entity._id) {
      errors.push('Missing entity._id in payload')
    }
  }

  if (!payloadObj.token || typeof payloadObj.token !== 'string') {
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
export function extractEntityId (payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const payloadObj = payload as Record<string, unknown>
  const entity = payloadObj.entity

  if (!entity || typeof entity !== 'object') {
    return null
  }

  const entityObj = entity as Record<string, unknown>
  const entityId = typeof entityObj._id === 'string' ? entityObj._id : null

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
export function extractUserToken (payload: unknown): {
  token: string | null
  userId: string | null
  userEmail: string | null
} {
  if (!payload || typeof payload !== 'object') {
    return { token: null, userId: null, userEmail: null }
  }

  const payloadObj = payload as Record<string, unknown>
  const token = typeof payloadObj.token === 'string' ? payloadObj.token : null

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
    const decodedPayload = JSON.parse(Buffer.from(parts[1]!, 'base64').toString())
    const userId = decodedPayload.accounts?.[decodedPayload.db] || decodedPayload.accounts?.esmuuseum || null
    const userEmail = decodedPayload.user?.email || null

    return { token, userId, userEmail }
  }
  // Constitutional: Error type is unknown - we catch and validate errors at boundaries
  // Principle I: Type Safety First - documented exception for error handling
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to decode JWT token', { error: errorMessage })
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
const requestCounts = new Map<string, { count: number, resetAt: number }>()

export function checkRateLimit (
  event: H3Event,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  // Get client IP
  const ip = getHeader(event, 'x-forwarded-for')
    || getHeader(event, 'x-real-ip')
    || 'unknown'

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
  }
  else {
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
export function sanitizePayloadForLogging (payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  // Constitutional: Payload can be any object structure - we sanitize at this boundary
  // Principle I: Type Safety First - documented exception for flexible logging utility
  const payloadObj = payload as Record<string, unknown>

  // Create shallow copy
  const sanitized = { ...payloadObj }

  // Remove potentially sensitive fields
  const sensitiveFields = ['token', 'api_key', 'apiKey', 'secret', 'password']

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***'
    }
  }

  return sanitized
}
