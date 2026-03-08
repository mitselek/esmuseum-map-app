/**
 * Global mocks that must be available BEFORE any library imports (e.g. MSW).
 * This file is listed first in vitest.config.ts setupFiles so it runs
 * before setup.ts which imports MSW.
 */
import { afterEach } from 'vitest'
import { readonly } from 'vue'

// Mock localStorage — MSW's CookieStore calls localStorage.getItem()
// at module load time, so this must be defined before MSW is imported.
const mockLocalStorage = {
  store: new Map<string, string>(),
  getItem: (key: string) => mockLocalStorage.store.get(key) ?? null,
  setItem: (key: string, value: string) => mockLocalStorage.store.set(key, value),
  removeItem: (key: string) => { mockLocalStorage.store.delete(key) },
  clear: () => { mockLocalStorage.store.clear() },
  get length () { return mockLocalStorage.store.size },
  key: (index: number) => [...mockLocalStorage.store.keys()][index] ?? null
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Mock window — needed when import.meta.client is true (via vitest define)
// so that client-only code paths (e.g. window.addEventListener) don't crash in node env
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} })
  }
}

// Stub `readonly` globally — composables using readonly() need this in node env.
// ref, computed, watch are stubbed in setup.ts, but readonly was missing (caused gotchas).
;(globalThis as any).readonly = readonly

afterEach(() => {
  mockLocalStorage.clear()
})
