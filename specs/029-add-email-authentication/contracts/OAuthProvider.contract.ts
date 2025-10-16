/**
 * OAuth Provider Type Contract
 *
 * Defines the type-safe contract for OAuth providers used throughout the application.
 * This contract ensures that only valid provider strings are used when initiating authentication.
 */

/**
 * Union type of all supported OAuth providers
 *
 * @example
 * ```typescript
 * const provider: OAuthProvider = 'e-mail' // ✓ Valid
 * const invalid: OAuthProvider = 'facebook' // ✗ TypeScript error
 * ```
 */
export type OAuthProvider
  = | 'google'
    | 'apple'
    | 'smart-id'
    | 'mobile-id'
    | 'id-card'
    | 'e-mail' // NEW: Email authentication provider

/**
 * OAuth provider constants object
 *
 * Use these constants instead of string literals for type safety and refactoring support.
 *
 * @example
 * ```typescript
 * import { OAUTH_PROVIDERS } from '~/composables/useEntuOAuth'
 *
 * const provider = OAUTH_PROVIDERS.EMAIL // 'e-mail'
 * ```
 */
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple',
  SMART_ID: 'smart-id',
  MOBILE_ID: 'mobile-id',
  ID_CARD: 'id-card',
  EMAIL: 'e-mail' // NEW
} as const

/**
 * OAuth provider display configuration
 *
 * Maps provider IDs to user-facing display labels.
 */
export interface OAuthProviderConfig {
  /** Provider identifier matching OAuthProvider type */
  id: OAuthProvider

  /** Human-readable label for UI display */
  label: string

  /** Optional icon identifier (for future enhancement) */
  icon?: string
}

/**
 * Expected provider configurations for login page
 *
 * @example
 * ```typescript
 * const providers: OAuthProviderConfig[] = [
 *   { id: 'google', label: 'Google' },
 *   { id: 'e-mail', label: 'Email' }
 * ]
 * ```
 */
export type OAuthProviderList = readonly OAuthProviderConfig[]
