import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { authApiMocks } from './mocks/entu-auth-api'
import { taskApiMocks } from './mocks/task-api'
import { ref, computed, watch } from 'vue'

// Make Vue reactivity available globally for composable tests
;(global as any).ref = ref
;(global as any).computed = computed
;(global as any).watch = watch

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
