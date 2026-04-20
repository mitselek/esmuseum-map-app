/**
 * Nuxt Runtime Config Mock
 *
 * Provides a mock for useRuntimeConfig() and other Nitro/Nuxt auto-imports
 * that are unavailable in plain Vitest (non-Nuxt test runner).
 */

import { vi } from 'vitest'

/**
 * Default test runtime config values matching .env.example / vitest.config.ts
 */
export interface MockRuntimeConfig {
  entuKey: string
  entuApiUrl: string
  entuClientId: string
  webhookSecret: string
  public: {
    entuUrl: string
    entuAccount: string
    entuClientId: string
    callbackOrigin: string
  }
}

export const defaultMockRuntimeConfig: MockRuntimeConfig = {
  entuKey: 'test-key-not-real',
  entuApiUrl: 'https://api.entu.app',
  entuClientId: 'esmuuseum',
  webhookSecret: 'test-webhook-secret',
  public: {
    entuUrl: 'https://api.entu.app',
    entuAccount: 'esmuuseum',
    entuClientId: 'test-client-id',
    callbackOrigin: 'http://localhost:3000'
  }
}

/**
 * Install Nitro/Nuxt auto-import mocks as globals.
 *
 * Call in beforeEach or at the top of a test file:
 * ```ts
 * import { installNuxtMocks } from '~/tests/helpers/nuxt-runtime-mock'
 *
 * beforeEach(() => {
 *   installNuxtMocks()
 * })
 * ```
 *
 * You can override specific config values:
 * ```ts
 * installNuxtMocks({ webhookSecret: 'custom-secret' })
 * ```
 */
export function installNuxtMocks (configOverrides?: Partial<MockRuntimeConfig>): void {
  const config = configOverrides
    ? mergeConfig(defaultMockRuntimeConfig, configOverrides)
    : defaultMockRuntimeConfig

  // useRuntimeConfig — used in server utils and API routes
  ;(globalThis as Record<string, unknown>).useRuntimeConfig = () => config

  // createError — Nitro auto-import, creates H3-compatible errors
  ;(globalThis as Record<string, unknown>).createError = (
    input: { statusCode: number, statusMessage: string }
  ) => {
    const err = new Error(input.statusMessage) as Error & {
      statusCode: number
      statusMessage: string
    }
    err.statusCode = input.statusCode
    err.statusMessage = input.statusMessage
    return err
  }

  // H3 helpers that Nitro auto-imports in server context
  ;(globalThis as Record<string, unknown>).getHeader = vi.fn(
    (_event: unknown, name: string) => {
      const e = _event as { _headers?: Record<string, string> }
      return e._headers?.[name.toLowerCase()] ?? null
    }
  )
  ;(globalThis as Record<string, unknown>).getQuery = vi.fn(
    (_event: unknown) => {
      const e = _event as { _query?: Record<string, string> }
      return e._query ?? {}
    }
  )
  ;(globalThis as Record<string, unknown>).readBody = vi.fn(
    async (_event: unknown) => {
      const e = _event as { _body?: unknown }
      return e._body
    }
  )
  ;(globalThis as Record<string, unknown>).getRouterParam = vi.fn(
    (_event: unknown, name: string) => {
      const e = _event as { context?: { params?: Record<string, string> } }
      return e.context?.params?.[name] ?? null
    }
  )
  ;(globalThis as Record<string, unknown>).getCookie = vi.fn(
    (_event: unknown, name: string) => {
      const e = _event as { _cookies?: Record<string, string> }
      return e._cookies?.[name] ?? null
    }
  )
  ;(globalThis as Record<string, unknown>).deleteCookie = vi.fn()
  ;(globalThis as Record<string, unknown>).setCookie = vi.fn()
  ;(globalThis as Record<string, unknown>).setResponseStatus = vi.fn()
  ;(globalThis as Record<string, unknown>).defineEventHandler = (
    handler: (event: unknown) => unknown
  ) => handler
}

/**
 * Remove all installed Nuxt mocks from globalThis.
 * Call in afterEach if needed for isolation.
 */
export function cleanupNuxtMocks (): void {
  const keys = [
    'useRuntimeConfig',
    'createError',
    'getHeader',
    'getQuery',
    'readBody',
    'getRouterParam',
    'getCookie',
    'deleteCookie',
    'setCookie',
    'setResponseStatus',
    'defineEventHandler'
  ] as const

  const g = globalThis as Record<string, unknown>
  for (const key of keys) {
    g[key] = undefined
  }
}

/**
 * Shallow merge config with overrides (one level deep for `public`).
 */
function mergeConfig (
  base: MockRuntimeConfig,
  overrides: Partial<MockRuntimeConfig>
): MockRuntimeConfig {
  return {
    ...base,
    ...overrides,
    public: {
      ...base.public,
      ...(overrides.public ?? {})
    }
  }
}
