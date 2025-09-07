/**
 * MSW mocks for task API endpoints
 * Supports /api/tasks/[id] and /api/tasks/search with authentication
 */
import { http, HttpResponse } from 'msw'
import { 
  mockTasks, 
  mockMaps, 
  mockGroups, 
  getTaskById, 
  getMapById, 
  getGroupById, 
  searchTasks, 
  createMockTaskSearchResponse,
  type TaskEntity
} from './data/tasks'
import { mockTokens, mockUsers } from './jwt-tokens'

/**
 * Helper to validate Bearer token and return user info
 */
function authenticateRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, status: 401, message: 'Authorization header is required' }
  }
  
  const token = authHeader.substring(7)
  
  // Check for valid tokens
  if (token === mockTokens.valid) {
    return { 
      authenticated: true, 
      user: { 
        _id: mockUsers.student._id,
        email: mockUsers.student.email,
        name: mockUsers.student.name 
      }
    }
  }
  
  if (token === mockTokens.expired) {
    return { authenticated: false, status: 401, message: 'Token expired' }
  }
  
  if (token === mockTokens.malformed || token === mockTokens.invalidSignature) {
    return { authenticated: false, status: 401, message: 'Invalid token' }
  }
  
  return { authenticated: false, status: 401, message: 'Authentication failed' }
}

/**
 * Check if user has permission to access a task
 * For now, allow all authenticated users (matching server implementation)
 */
function checkTaskPermission(user: any, taskId: string): boolean {
  // For compatibility with current server behavior, allow all authenticated users
  return true
}

export const taskApiMocks = [
  // GET /api/tasks/search - Search tasks (must come before :id route)
  http.get('*/api/tasks/search', ({ request }) => {
    const auth = authenticateRequest(request)
    
    if (!auth.authenticated) {
      return new HttpResponse(
        JSON.stringify({ error: auth.message }), 
        { 
          status: auth.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    const url = new URL(request.url)
    const query: Record<string, any> = {}
    
    // Extract query parameters
    for (const [key, value] of url.searchParams.entries()) {
      query[key] = value
    }
    
    // Handle pagination parameters
    let page = 1
    let perPage = 10
    
    if (query.page) {
      const pageNum = parseInt(query.page, 10)
      if (!isNaN(pageNum) && pageNum > 0) {
        page = pageNum
      }
    }
    
    if (query.per_page) {
      const perPageNum = parseInt(query.per_page, 10)
      if (!isNaN(perPageNum) && perPageNum > 0 && perPageNum <= 100) {
        perPage = perPageNum
      }
    }
    
    // Calculate skip and limit for the search
    query.skip = (page - 1) * perPage
    query.limit = perPage
    
    // Search for tasks
    const allMatchingTasks = searchTasks(query)
    
    // Apply pagination to results
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedTasks = allMatchingTasks.slice(startIndex, endIndex)
    
    // Return in the same format as server API (/api/tasks/search.get.ts)
    return HttpResponse.json(createMockTaskSearchResponse(paginatedTasks, { ...query, count: allMatchingTasks.length }))
  }),

  // GET /api/tasks/[id] - Get task by ID
  http.get('*/api/tasks/:id', ({ params, request }) => {
    const { id } = params
    const auth = authenticateRequest(request)
    
    if (!auth.authenticated) {
      return new HttpResponse(
        JSON.stringify({ error: auth.message }), 
        { 
          status: auth.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    const task = getTaskById(id as string)
    
    if (!task) {
      return HttpResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Simulate permission check - user can only see tasks they have access to
    // For now, allow access to all tasks for testing
    
    // Return in the same format as server API (/api/tasks/[id].get.ts)
    return HttpResponse.json({
      entity: task
    })
  }),

  // Mock individual entity lookups for referenced entities
  http.get('*/api/esmuuseum/entity/:id', ({ params, request }) => {
    const auth = authenticateRequest(request)
    
    if (!auth.authenticated) {
      return new HttpResponse(
        JSON.stringify({ error: auth.message }), 
        { 
          status: auth.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    const { id } = params
    const entityId = id as string
    
    // Check for task entities
    const task = getTaskById(entityId)
    if (task) {
      return HttpResponse.json(task)
    }
    
    // Check for map entities
    const map = getMapById(entityId)
    if (map) {
      return HttpResponse.json(map)
    }
    
    // Check for group entities
    const group = getGroupById(entityId)
    if (group) {
      return HttpResponse.json(group)
    }
    
    // Check for user entities (from existing auth mocks)
    if (entityId === mockUsers.student._id) {
      return HttpResponse.json({
        _id: mockUsers.student._id,
        properties: {
          email: [{ value: mockUsers.student.email }],
          displayname: [{ value: mockUsers.student.displayname }]
        },
        _parent: [
          {
            entity_type: 'grupp',
            reference: 'group_001',
            string: 'Museum Visitors'
          }
        ]
      })
    }
    
    return new HttpResponse(
      JSON.stringify({ message: 'Entity not found' }),
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }),

  // Mock general search endpoint for testing various queries
  http.get('*/api/esmuuseum/entity', ({ request }) => {
    const auth = authenticateRequest(request)
    
    if (!auth.authenticated) {
      return new HttpResponse(
        JSON.stringify({ error: auth.message }), 
        { 
          status: auth.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    const url = new URL(request.url)
    const query: Record<string, any> = {}
    
    // Extract query parameters
    for (const [key, value] of url.searchParams.entries()) {
      query[key] = value
    }
    
    // Handle task type searches
    if (query['_type.string'] === 'ulesanne' || query._type === 'ulesanne') {
      const matchingTasks = searchTasks(query)
      return HttpResponse.json({
        entities: matchingTasks,
        count: matchingTasks.length
      })
    }
    
    // Handle map type searches
    if (query['_type.string'] === 'kaart' || query._type === 'kaart') {
      return HttpResponse.json({
        entities: mockMaps,
        count: mockMaps.length
      })
    }
    
    // Handle group type searches
    if (query['_type.string'] === 'grupp' || query._type === 'grupp') {
      return HttpResponse.json({
        entities: mockGroups,
        count: mockGroups.length
      })
    }
    
    // Default: empty result
    return HttpResponse.json({
      entities: [],
      count: 0
    })
  }),

  // Mock error scenarios for testing
  http.get('*/api/tasks/error-500', () => {
    return new HttpResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }),

  http.get('*/api/tasks/rate-limited', () => {
    return new HttpResponse(
      JSON.stringify({ message: 'Rate limit exceeded' }),
      { 
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    )
  }),

  // User profile endpoint
  http.get('http://localhost:3000/api/user/profile', async ({ request }) => {
    console.log('MSW: Handling GET /api/user/profile')

    const auth = authenticateRequest(request)
    
    if (!auth.authenticated) {
      return new HttpResponse(
        JSON.stringify({ error: auth.message }), 
        { 
          status: auth.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Return the authenticated user's profile
    // Use the person entity from our mock data
    const userProfile = {
      _id: '66b6245c7efc9ac06a437b97',
      _type: [{
        _id: '66b6245c7efc9ac06a437b98',
        reference: '66b6245a7efc9ac06a437920',
        property_type: '_type',
        string: 'person',
        entity_type: 'entity'
      }],
      name: [{ _id: 'name_person_001', string: 'Mihkel Putrinš' }],
      forename: [{ _id: '66b6245c7efc9ac06a437b9c', string: 'Mihkel' }],
      surname: [{ _id: '66b6245c7efc9ac06a437b9d', string: 'Putrinš' }],
      email: [{ _id: '66b6245c7efc9ac06a437b9b', string: 'mihkel.putrinsh@gmail.com' }],
      entu_user: [{ _id: '66b6245c7efc9ac06a437b9a', string: 'mihkel.putrinsh@gmail.com' }],
      idcode: [{ _id: '66d97142f2daf46b3145405c', string: '37204030303' }],
      photo: [{
        _id: '686a692e1749f351b9c830e4',
        filename: 'michelek.webp',
        filesize: 436144,
        filetype: 'image/webp'
      }],
      _sharing: [
        { _id: '66b6245c7efc9ac06a437b99', string: 'private' },
        { _id: '66b6245c7efc9ac06a437bc3', string: 'domain' }
      ],
      _parent: [
        {
          _id: '66b6245c7efc9ac06a437bbb',
          reference: '66b6245c7efc9ac06a437ba0',
          property_type: '_parent',
          string: 'esmuuseum',
          entity_type: 'database'
        }
      ],
      _inheritrights: [
        { _id: '66b6245c7efc9ac06a437bca', boolean: true }
      ],
      _created: [{ _id: '66b6245c7efc9ac06a437b9e', datetime: '2024-08-09T14:14:52.460Z' }],
      _owner: [
        {
          _id: '66b6245c7efc9ac06a437b9f',
          reference: '66b6245c7efc9ac06a437b97',
          property_type: '_owner',
          string: 'Mihkel Putrinš',
          entity_type: 'person'
        }
      ],
      _viewer: [
        {
          _id: '66b6245c7efc9ac06a437b9f',
          reference: '66b6245c7efc9ac06a437b97',
          property_type: '_owner',
          string: 'Mihkel Putrinš',
          entity_type: 'person'
        }
      ],
      _editor: [
        {
          _id: '66b6245c7efc9ac06a437b9f',
          reference: '66b6245c7efc9ac06a437b97',
          property_type: '_owner',
          string: 'Mihkel Putrinš',
          entity_type: 'person'
        }
      ]
    }

    console.log('MSW: Returning user profile')
    return HttpResponse.json({ entity: userProfile })
  })
]
