/**
 * JWT Token Validation Utilities
 *
 * Provides utilities for validating JWT tokens without requiring
 * full JWT verification (signature checking). Used for quick
 * client-side expiry checks before making API calls.
 */

/**
 * JWT token payload structure
 */
export interface TokenPayload {
  exp: number // Unix timestamp (seconds since epoch)
  user: string
  iat?: number // Issued at
  [key: string]: any // Allow other claims
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  isValid: boolean
  isExpired: boolean
  expiresAt: Date | null
  timeUntilExpiry: number | null // milliseconds
  error?: string
}

/**
 * Buffer time in seconds to add before considering token expired
 * This prevents edge cases where token expires mid-request
 */
const EXPIRY_BUFFER_SECONDS = 60

/**
 * Decode JWT token payload without verification
 *
 * WARNING: This does NOT verify the token signature!
 * Only use for client-side expiry checks. Server must
 * verify signature for security.
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid format
 */
export const decodeJWT = (token: string): TokenPayload | null => {
  if (!token || typeof token !== 'string') {
    return null
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('[Token] Invalid JWT format: expected 3 parts')
      return null
    }

    // Decode base64url payload (part[1])
    const payloadPart = parts[1]

    if (!payloadPart) {
      console.error('[Token] Missing payload part')
      return null
    }

    // Base64url to base64: replace - with +, _ with /, add padding
    const base64 = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // Decode and parse JSON
    const decoded = atob(base64)
    const parsed = JSON.parse(decoded) as TokenPayload

    return parsed
  }
  catch (error) {
    console.error('[Token] Failed to decode JWT:', error)
    return null
  }
}

/**
 * Check if token is expired
 *
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time before expiry (default: 60s)
 * @returns true if expired or invalid
 */
export const isTokenExpired = (token: string, bufferSeconds: number = EXPIRY_BUFFER_SECONDS): boolean => {
  const payload = decodeJWT(token)

  if (!payload || !payload.exp) {
    // Invalid token or missing expiry = treat as expired
    return true
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const expiryWithBuffer = payload.exp - bufferSeconds

  return nowSeconds >= expiryWithBuffer
}

/**
 * Validate token and return detailed information
 *
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time before expiry (default: 60s)
 * @returns Detailed validation result
 */
export const validateToken = (
  token: string,
  bufferSeconds: number = EXPIRY_BUFFER_SECONDS
): TokenValidationResult => {
  // Check if token exists
  if (!token) {
    return {
      isValid: false,
      isExpired: true,
      expiresAt: null,
      timeUntilExpiry: null,
      error: 'Token is missing'
    }
  }

  // Decode token
  const payload = decodeJWT(token)

  if (!payload) {
    return {
      isValid: false,
      isExpired: true,
      expiresAt: null,
      timeUntilExpiry: null,
      error: 'Invalid token format'
    }
  }

  // Check expiry
  if (!payload.exp) {
    return {
      isValid: false,
      isExpired: true,
      expiresAt: null,
      timeUntilExpiry: null,
      error: 'Token missing expiry claim'
    }
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const expiryWithBuffer = payload.exp - bufferSeconds
  const isExpired = nowSeconds >= expiryWithBuffer
  const expiresAt = new Date(payload.exp * 1000)
  const timeUntilExpiry = (payload.exp * 1000) - Date.now()

  return {
    isValid: !isExpired,
    isExpired,
    expiresAt,
    timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0
  }
}

/**
 * Get human-readable time until token expiry
 *
 * @param token - JWT token string
 * @returns Formatted string like "2 hours 30 minutes" or "expired"
 */
export const getTimeUntilExpiry = (token: string): string => {
  const validation = validateToken(token, 0) // No buffer for display

  if (!validation.isValid || validation.timeUntilExpiry === null) {
    return 'expired'
  }

  const ms = validation.timeUntilExpiry
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }
  else if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
  }
  else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
  }
}
