/**
 * TDD tests for AppLogo.vue component (RED phase — component does not exist yet)
 *
 * AppLogo.vue expected behavior:
 * - Renders an <img> tag with the museum logo
 * - Locale-aware: et → esm-logo-et.svg, en → esm-logo-en.svg, other (uk, lv) → esm_logo.png
 * - Accepts optional `class` prop for sizing (default: 'h-20 w-auto')
 * - Has proper alt text (i18n translated via $t('museumLogoAlt') or similar key)
 *
 * These tests exercise the logo resolution logic that must be exported from AppLogo.vue.
 */
import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// Attempt to import the named export that AppLogo.vue must expose.
// This import WILL FAIL until the component is created — that is intentional
// (TDD red phase). The component should export `resolveLogoSrc` as a helper
// so it can be unit-tested without a DOM environment.
// ---------------------------------------------------------------------------
let resolveLogoSrc: ((locale: string) => string) | undefined

try {
  // Dynamic import so the test file itself doesn't hard-crash — we get a
  // controlled failure inside the test assertions instead.
  const mod = await import('../../app/components/AppLogo.vue')
  resolveLogoSrc = (mod as any).resolveLogoSrc
}
catch {
  resolveLogoSrc = undefined
}

// ---------------------------------------------------------------------------
// Expected logo paths (must match /public/ assets)
// ---------------------------------------------------------------------------
const LOGO_ET = '/esm-logo-et.svg'
const LOGO_EN = '/esm-logo-en.svg'
const LOGO_FALLBACK = '/esm_logo.png'

// ---------------------------------------------------------------------------
// Helper: assert resolveLogoSrc is available (fails if component missing)
// ---------------------------------------------------------------------------
function getResolver (): (locale: string) => string {
  if (!resolveLogoSrc) {
    throw new Error(
      'resolveLogoSrc is not exported from AppLogo.vue — component does not exist yet (RED phase)'
    )
  }
  return resolveLogoSrc
}

describe('AppLogo — resolveLogoSrc (locale-to-logo mapping)', () => {
  describe('Estonian locale', () => {
    it('returns the Estonian SVG logo for locale "et"', () => {
      const resolve = getResolver()
      expect(resolve('et')).toBe(LOGO_ET)
    })
  })

  describe('English locale', () => {
    it('returns the English SVG logo for locale "en"', () => {
      const resolve = getResolver()
      expect(resolve('en')).toBe(LOGO_EN)
    })
  })

  describe('Ukrainian locale (fallback)', () => {
    it('returns the fallback PNG logo for locale "uk"', () => {
      const resolve = getResolver()
      expect(resolve('uk')).toBe(LOGO_FALLBACK)
    })
  })

  describe('Latvian locale (fallback)', () => {
    it('returns the fallback PNG logo for locale "lv"', () => {
      const resolve = getResolver()
      expect(resolve('lv')).toBe(LOGO_FALLBACK)
    })
  })

  describe('Unknown / empty locale (fallback)', () => {
    it('returns the fallback PNG logo for an empty string', () => {
      const resolve = getResolver()
      expect(resolve('')).toBe(LOGO_FALLBACK)
    })

    it('returns the fallback PNG logo for an unrecognised locale', () => {
      const resolve = getResolver()
      expect(resolve('fr')).toBe(LOGO_FALLBACK)
    })
  })
})

describe('AppLogo — default CSS class', () => {
  it('exports DEFAULT_CLASS constant as "h-20 w-auto"', async () => {
    // AppLogo.vue must export DEFAULT_CLASS so tests can assert the default
    // without mounting the component in a DOM environment.
    let defaultClass: string | undefined

    try {
      const mod = await import('../../app/components/AppLogo.vue') as Record<string, unknown>
      defaultClass = mod.DEFAULT_CLASS as string | undefined
    }
    catch {
      defaultClass = undefined
    }

    if (defaultClass === undefined) {
      throw new Error(
        'DEFAULT_CLASS is not exported from AppLogo.vue — component does not exist yet (RED phase)'
      )
    }

    expect(defaultClass).toBe('h-20 w-auto')
  })
})

describe('AppLogo — component module shape', () => {
  it('AppLogo.vue module exports a default Vue component', async () => {
    // The module must exist and have a default export (the Vue component)
    let defaultExport: unknown
    try {
      const mod = await import('../../app/components/AppLogo.vue')
      defaultExport = mod.default
    }
    catch {
      defaultExport = undefined
    }

    if (defaultExport === undefined) {
      throw new Error(
        'AppLogo.vue does not exist or has no default export (RED phase)'
      )
    }

    // A compiled Vue SFC default export is an object with a `setup` or `render` key
    expect(typeof defaultExport).toBe('object')
    expect(defaultExport).not.toBeNull()
  })

  it('AppLogo.vue exports resolveLogoSrc as a named export', () => {
    if (!resolveLogoSrc) {
      throw new Error(
        'resolveLogoSrc named export missing from AppLogo.vue (RED phase)'
      )
    }
    expect(typeof resolveLogoSrc).toBe('function')
  })
})
