/**
 * useEntuOAuth Composable Contract
 * 
 * Defines the type-safe interface for the OAuth authentication composable.
 * This contract ensures consistent OAuth functionality across the application.
 */

import type { ComputedRef, Ref } from 'vue'
import type { OAuthProvider } from './OAuthProvider.contract'
import type { EntuAuthResponse } from '~/composables/useEntuAuth'

/**
 * Return type of useEntuOAuth composable
 * 
 * Provides OAuth authentication methods and state management for Entu API.
 */
export interface UseEntuOAuthReturn {
  // ============================================================================
  // Methods
  // ============================================================================
  
  /**
   * Initiate OAuth authentication flow for specified provider
   * 
   * Redirects browser to OAuth.ee authentication page for the given provider.
   * For email provider, user will be prompted to enter email and verification code.
   * 
   * @param provider - OAuth provider to authenticate with (including 'e-mail')
   * @returns true if redirect initiated successfully, false if validation failed
   * 
   * @example
   * ```typescript
   * const { startOAuthFlow } = useEntuOAuth()
   * 
   * // Start email authentication
   * startOAuthFlow('e-mail')
   * // Browser redirects to OAuth.ee email verification page
   * ```
   * 
   * @throws {Error} If provider is invalid or not in OAUTH_PROVIDERS
   */
  startOAuthFlow: (provider: OAuthProvider) => boolean
  
  /**
   * Handle OAuth callback after successful authentication
   * 
   * Extracts JWT token from callback URL, exchanges it for user session,
   * and redirects to original destination.
   * 
   * @returns User authentication data if successful, null if failed
   * 
   * @example
   * ```typescript
   * // In /auth/callback page
   * const { handleOAuthCallback } = useEntuOAuth()
   * 
   * const authData = await handleOAuthCallback()
   * if (authData) {
   *   // User authenticated, redirect handled automatically
   * }
   * ```
   */
  handleOAuthCallback: () => Promise<EntuAuthResponse | null>
  
  // ============================================================================
  // State
  // ============================================================================
  
  /**
   * OAuth provider constants for type-safe provider selection
   * 
   * @example
   * ```typescript
   * const { providers, startOAuthFlow } = useEntuOAuth()
   * 
   * // Use constants instead of strings
   * startOAuthFlow(providers.EMAIL)
   * ```
   */
  providers: typeof import('./OAuthProvider.contract').OAUTH_PROVIDERS
  
  /**
   * Loading state during OAuth operations
   * 
   * True when OAuth flow is in progress (redirect or callback processing)
   */
  isLoading: Ref<boolean>
  
  /**
   * Error message from failed OAuth operations
   * 
   * Null when no error, string message when OAuth fails
   */
  error: Ref<string | null>
  
  /**
   * Computed authentication status
   * 
   * True if user has valid session token, false otherwise
   */
  isAuthenticated: ComputedRef<boolean>
}

/**
 * OAuth configuration for runtime environment
 * 
 * Loaded from Nuxt runtime config (nuxt.config.ts)
 */
export interface OAuthConfig {
  /** Entu API base URL (default: https://entu.app) */
  entuUrl?: string
  
  /** Entu account identifier (default: esmuuseum) */
  entuAccount?: string
  
  /** OAuth callback origin override (default: window.location.origin) */
  callbackOrigin?: string
}

/**
 * OAuth flow state for testing and debugging
 */
export interface OAuthFlowState {
  /** Currently active provider (during redirect) */
  activeProvider: OAuthProvider | null
  
  /** OAuth callback URL constructed for redirect */
  callbackUrl: string | null
  
  /** OAuth.ee authentication URL for redirect */
  authUrl: string | null
}
