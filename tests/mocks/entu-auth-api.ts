/**
 * MSW mocks for Entu API authentication endpoints
 */
import { http, HttpResponse } from 'msw'
import { mockTokens, mockUsers, mockAuthResponses } from './jwt-tokens'

export const authApiMocks = [
  // Mock the Entu auth endpoint for token validation
  http.get('*/api/esmuuseum', ({ request }) => {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    
    // Simulate different token scenarios
    if (token === mockTokens.valid) {
      return HttpResponse.json({
        user: mockUsers.student,
        accounts: [{
          user: { _id: mockUsers.student._id }
        }]
      })
    }
    
    if (token === mockTokens.expired) {
      return new HttpResponse(null, { status: 401 })
    }
    
    if (token === mockTokens.malformed) {
      return new HttpResponse(null, { status: 401 })
    }
    
    if (token === mockTokens.invalidSignature) {
      return new HttpResponse(null, { status: 401 })
    }
    
    // Default: unauthorized
    return new HttpResponse(null, { status: 401 })
  }),

  // Mock token refresh/authentication endpoint
  http.get('*/api/auth', ({ request }) => {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)
    const account = url.searchParams.get('account')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 })
    }
    
    if (account !== 'esmuuseum' && account !== 'test-account') {
      return new HttpResponse(null, { status: 404 })
    }
    
    const token = authHeader.substring(7)
    
    // Simulate API key authentication (for getToken calls)
    if (token === 'test-key-not-real') {
      return HttpResponse.json(mockAuthResponses.validAuth)
    }
    
    // Simulate OAuth token validation
    if (token === mockTokens.valid) {
      return HttpResponse.json(mockAuthResponses.validAuth)
    }
    
    return new HttpResponse(null, { status: 401 })
  }),

  // Mock entity endpoints for testing user profile fetching
  http.get('*/api/esmuuseum/entity/:id', ({ params }) => {
    const { id } = params
    
    if (id === mockUsers.student._id) {
      return HttpResponse.json({
        _id: mockUsers.student._id,
        properties: {
          email: [{ value: mockUsers.student.email }],
          displayname: [{ value: mockUsers.student.displayname }]
        },
        _parent: [
          {
            entity_type: 'grupp',
            reference: 'group-123',
            string: 'Test Group A'
          },
          {
            entity_type: 'grupp', 
            reference: 'group-456',
            string: 'Test Group B'
          }
        ]
      })
    }
    
    return new HttpResponse(null, { status: 404 })
  }),

  // Mock search endpoints
  http.get('*/api/esmuuseum/search', ({ request }) => {
    const url = new URL(request.url)
    const typeParam = url.searchParams.get('_type.string')
    
    if (typeParam === 'ulesanne') {
      return HttpResponse.json({
        entities: [
          {
            _id: 'task-123',
            properties: {
              title: [{ value: 'Test Task 1' }],
              description: [{ value: 'Test task description' }]
            }
          },
          {
            _id: 'task-456', 
            properties: {
              title: [{ value: 'Test Task 2' }],
              description: [{ value: 'Another test task' }]
            }
          }
        ]
      })
    }
    
    return HttpResponse.json({ entities: [] })
  }),

  // Mock rate limiting scenario
  http.get('*/api/esmuuseum/rate-limited', () => {
    return new HttpResponse(null, { 
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    })
  }),

  // Mock server error scenario
  http.get('*/api/esmuuseum/server-error', () => {
    return new HttpResponse(null, { status: 500 })
  })
]
