/**
 * MSW Handlers for Entu API — Server-Side Testing
 *
 * Reusable MSW handlers for common Entu API patterns used in server routes.
 * These complement the existing client-side mocks in tests/mocks/.
 */

import { http, HttpResponse } from 'msw'

/**
 * Entu property value in the standard array-of-objects format.
 */
export interface MockEntuProperty {
  _id?: string
  string?: string
  number?: number
  boolean?: boolean
  reference?: string
  datetime?: string
  filename?: string
  filesize?: number
  filetype?: string
  entity_type?: string
  property_type?: string
}

/**
 * Minimal mock Entu entity shape.
 */
export interface MockEntuEntity {
  _id: string
  _type?: MockEntuProperty[]
  [key: string]: MockEntuProperty[] | string | undefined
}

// ---------------------------------------------------------------------------
// Entity store — tests populate this, handlers read from it
// ---------------------------------------------------------------------------

const entityStore = new Map<string, MockEntuEntity>()

/**
 * Seed the mock entity store. Call in beforeEach to set up test data.
 */
export function seedEntities (entities: MockEntuEntity[]): void {
  entityStore.clear()
  for (const entity of entities) {
    entityStore.set(entity._id, entity)
  }
}

/**
 * Add a single entity to the store (useful mid-test).
 */
export function addEntity (entity: MockEntuEntity): void {
  entityStore.set(entity._id, entity)
}

/**
 * Clear all seeded entities.
 */
export function clearEntities (): void {
  entityStore.clear()
}

// ---------------------------------------------------------------------------
// Entity creation tracking
// ---------------------------------------------------------------------------

export interface CreatedEntity {
  body: unknown
  timestamp: number
}

const createdEntities: CreatedEntity[] = []

export function getCreatedEntities (): CreatedEntity[] {
  return [...createdEntities]
}

export function clearCreatedEntities (): void {
  createdEntities.length = 0
}

// ---------------------------------------------------------------------------
// MSW Handlers
// ---------------------------------------------------------------------------

const ENTU_BASE = '*/api/:account'

/**
 * Handler: GET /api/:account/entity/:id
 * Returns entity from the seeded store, or 404.
 */
const entityGetHandler = http.get(
  `${ENTU_BASE}/entity/:id`,
  ({ params }) => {
    const id = params.id as string
    const entity = entityStore.get(id)

    if (!entity) {
      return HttpResponse.json(
        { error: `Entity ${id} not found` },
        { status: 404 }
      )
    }

    return HttpResponse.json({ entity })
  }
)

/**
 * Handler: GET /api/:account/entity (search)
 * Returns entities filtered by _type.string query param.
 */
const entitySearchHandler = http.get(
  `${ENTU_BASE}/entity`,
  ({ request }) => {
    const url = new URL(request.url)
    const typeFilter = url.searchParams.get('_type.string')

    let results = [...entityStore.values()]

    if (typeFilter) {
      results = results.filter((e) => {
        const typeArr = e._type
        if (!Array.isArray(typeArr)) return false
        return typeArr.some((t) => t.string === typeFilter)
      })
    }

    return HttpResponse.json({
      entities: results,
      count: results.length
    })
  }
)

/**
 * Handler: POST /api/:account/entity
 * Records the created entity payload and returns a mock _id.
 */
const entityCreateHandler = http.post(
  `${ENTU_BASE}/entity`,
  async ({ request }) => {
    const body = await request.json()
    createdEntities.push({ body, timestamp: Date.now() })

    return HttpResponse.json({
      _id: `mock-created-${Date.now()}`
    })
  }
)

/**
 * Handler: POST /api/:account/entity/:id (update)
 * Records the update and returns success.
 */
const entityUpdateHandler = http.post(
  `${ENTU_BASE}/entity/:id`,
  async ({ params, request }) => {
    const id = params.id as string
    const body = await request.json()
    createdEntities.push({ body, timestamp: Date.now() })

    return HttpResponse.json({ _id: id })
  }
)

/**
 * Handler: GET /api/auth (token exchange)
 * Returns a mock auth response.
 */
const authHandler = http.get(
  '*/api/auth',
  ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return HttpResponse.json({
      token: 'mock-entu-jwt-token',
      user: { _id: 'mock-user-id', email: 'test@example.com' },
      accounts: [{ _id: 'esmuuseum', user: { _id: 'mock-user-id' } }]
    })
  }
)

/**
 * All server-side Entu API handlers bundled together.
 * Use with MSW setupServer or server.use().
 */
export const entuServerHandlers = [
  entityGetHandler,
  entitySearchHandler,
  entityCreateHandler,
  entityUpdateHandler,
  authHandler
]

/**
 * Convenience: build a mock entity with common Entu patterns.
 */
export function buildMockEntity (
  id: string,
  type: string,
  properties: Record<string, MockEntuProperty[]> = {}
): MockEntuEntity {
  return {
    _id: id,
    _type: [{ string: type }],
    ...properties
  }
}

/**
 * Build a mock task (ülesanne) entity.
 */
export function buildMockTask (
  id: string,
  overrides: Record<string, MockEntuProperty[]> = {}
): MockEntuEntity {
  return buildMockEntity(id, 'ülesanne', {
    nimi: [{ string: `Task ${id}` }],
    kirjeldus: [{ string: `Description for ${id}` }],
    ...overrides
  })
}

/**
 * Build a mock response (vastus) entity.
 */
export function buildMockResponse (
  id: string,
  taskId: string,
  overrides: Record<string, MockEntuProperty[]> = {}
): MockEntuEntity {
  return buildMockEntity(id, 'vastus', {
    ülesanne: [{ reference: taskId }],
    ...overrides
  })
}

/**
 * Build a mock person entity.
 */
export function buildMockPerson (
  id: string,
  overrides: Record<string, MockEntuProperty[]> = {}
): MockEntuEntity {
  return buildMockEntity(id, 'person', {
    forename: [{ string: 'Test' }],
    surname: [{ string: 'User' }],
    email: [{ string: 'test@example.com' }],
    ...overrides
  })
}

/**
 * Build a mock group (grupp) entity.
 */
export function buildMockGroup (
  id: string,
  name: string,
  overrides: Record<string, MockEntuProperty[]> = {}
): MockEntuEntity {
  return buildMockEntity(id, 'grupp', {
    nimi: [{ string: name }],
    ...overrides
  })
}
