import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { authApiMocks } from './mocks/entu-auth-api'
import { taskApiMocks } from './mocks/task-api'

// Mock Vue's ref for composables
const _mockRefs = new Map<any, any>()

;(global as any).ref = function <T>(value: T) {
  const refObj = {
    value
  }
  _mockRefs.set(refObj, value)
  return refObj
}

// Mock computed for composables
;(global as any).computed = function <T>(getter: () => T) {
  return {
    get value() {
      return getter()
    }
  }
}

// Mock document object for DOM manipulation in tests
const _classesSet = new Set<string>()
const mockDocument = {
  body: {
    classList: {
      add (className: string) {
        _classesSet.add(className)
      },
      remove (className: string) {
        _classesSet.delete(className)
      },
      contains (className: string): boolean {
        return _classesSet.has(className)
      }
    },
    className: ''
  }
}

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
  configurable: true
})

// Setup MSW server with all API mocks
const server = setupServer(...authApiMocks, ...taskApiMocks)

// Export server for use in individual tests
export { server }

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mock localStorage for client-side tests
const mockLocalStorage = {
  store: new Map<string, string>(),
  getItem: (key: string) => mockLocalStorage.store.get(key) || null,
  setItem: (key: string, value: string) => mockLocalStorage.store.set(key, value),
  removeItem: (key: string) => mockLocalStorage.store.delete(key),
  clear: () => mockLocalStorage.store.clear()
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Reset localStorage before each test
afterEach(() => {
  mockLocalStorage.clear()
})

// Clean up document state and refs after each test
afterEach(() => {
  _classesSet.clear()
  mockDocument.body.className = ''
  _mockRefs.clear()
})
