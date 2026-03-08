/**
 * H3 Event Mock Factory
 *
 * Creates mock H3Event objects for testing server-side API handlers
 * without running a full Nitro server.
 */

import type { H3Event } from 'h3'

export interface MockEventOptions {
  method?: string
  headers?: Record<string, string>
  query?: Record<string, string>
  body?: unknown
  params?: Record<string, string>
  cookies?: Record<string, string>
  context?: Record<string, unknown>
}

/**
 * Create a mock H3Event with configurable options.
 *
 * Usage:
 * ```ts
 * const event = createMockH3Event({
 *   method: 'POST',
 *   headers: { authorization: 'Bearer test-token' },
 *   body: { db: 'esmuuseum', entity: { _id: '123' } },
 *   query: { account: 'esmuuseum' },
 *   params: { id: '123' },
 * })
 * ```
 */
export function createMockH3Event (options: MockEventOptions = {}): H3Event {
  const {
    method = 'GET',
    headers = {},
    query = {},
    body = undefined,
    params = {},
    cookies = {},
    context = {}
  } = options

  // Normalize header keys to lowercase (HTTP headers are case-insensitive)
  const normalizedHeaders: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    normalizedHeaders[key.toLowerCase()] = value
  }

  // Build a minimal H3Event-compatible object
  const event = {
    node: {
      req: {
        method,
        url: buildUrl(query),
        headers: normalizedHeaders
      },
      res: {
        statusCode: 200,
        setHeader: () => {},
        end: () => {}
      }
    },
    context: {
      params,
      ...context
    },
    _method: method,
    _headers: normalizedHeaders,
    _query: query,
    _body: body,
    _cookies: cookies
  } as unknown as H3Event

  return event
}

/**
 * Build a URL string from query params (for the mock req.url)
 */
function buildUrl (query: Record<string, string>): string {
  const entries = Object.entries(query)
  if (entries.length === 0) return '/'
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
  return `/?${qs}`
}

/**
 * Create a mock H3Event for webhook POST requests.
 * Pre-configured with typical webhook headers and structure.
 */
export function createMockWebhookEvent (payload: unknown, userToken?: string): H3Event {
  const headers: Record<string, string> = {
    'content-type': 'application/json'
  }

  if (userToken) {
    headers.authorization = `Bearer ${userToken}`
  }

  return createMockH3Event({
    method: 'POST',
    headers,
    body: payload
  })
}

/**
 * Create a mock H3Event for authenticated GET requests.
 */
export function createMockAuthenticatedEvent (
  token: string,
  options: Omit<MockEventOptions, 'headers'> & { headers?: Record<string, string> } = {}
): H3Event {
  return createMockH3Event({
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      ...options.headers
    }
  })
}

/**
 * Stub H3 auto-imported helpers for use with vi.mock().
 *
 * Usage in test files:
 * ```ts
 * vi.mock('h3', async (importOriginal) => {
 *   const actual = await importOriginal<typeof import('h3')>()
 *   return { ...actual, ...createH3Stubs(mockEvent) }
 * })
 * ```
 */
export function createH3Stubs (event: H3Event) {
  const e = event as unknown as {
    _headers: Record<string, string>
    _query: Record<string, string>
    _body: unknown
    _cookies: Record<string, string>
    context: { params: Record<string, string> }
  }

  return {
    getHeader: (_event: H3Event, name: string) => e._headers[name.toLowerCase()] ?? null,
    getHeaders: () => e._headers,
    getQuery: () => e._query,
    readBody: async () => e._body,
    getRouterParam: (_event: H3Event, name: string) => e.context.params?.[name] ?? null,
    getRouterParams: () => e.context.params,
    getCookie: (_event: H3Event, name: string) => e._cookies[name] ?? null,
    setCookie: () => {},
    deleteCookie: () => {},
    createError: (input: { statusCode: number, statusMessage: string }) => {
      const err = new Error(input.statusMessage) as Error & { statusCode: number, statusMessage: string }
      err.statusCode = input.statusCode
      err.statusMessage = input.statusMessage
      return err
    },
    defineEventHandler: (handler: (event: H3Event) => unknown) => handler,
    setResponseStatus: () => {},
    send: () => {}
  }
}
