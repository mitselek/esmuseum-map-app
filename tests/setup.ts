import { beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { authApiMocks } from './mocks/entu-auth-api'
import { taskApiMocks } from './mocks/task-api'
import { ref, computed, watch } from 'vue'

// Make Vue reactivity available globally for composable tests

;

(globalThis as any).ref = ref

;(globalThis as any).computed = computed

;(globalThis as any).watch = watch

// Setup MSW server with all API mocks
// Note: localStorage is mocked in setup-globals.ts which runs before this file
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
