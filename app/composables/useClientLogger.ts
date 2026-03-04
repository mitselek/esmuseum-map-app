/**
 * Client-side structured logger
 *
 * Provides consistent logging across client-side code:
 * - debug/info are dev-only (stripped in production via import.meta.dev)
 * - warn/error always emit (already allowed by ESLint rule)
 * - [module] prefix preserves searchability in EventDebugPanel
 */

export function useClientLogger (module: string) {
  const prefix = `[${module}]`

  return {
    debug: (...args: unknown[]) => {
      if (import.meta.dev) console.log(prefix, ...args) // eslint-disable-line no-console
    },
    info: (...args: unknown[]) => {
      if (import.meta.dev) console.log(prefix, ...args) // eslint-disable-line no-console
    },
    warn: (...args: unknown[]) => {
      console.warn(prefix, ...args)
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args)
    }
  }
}
