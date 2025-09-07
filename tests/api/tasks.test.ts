import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../setup'
import { http, HttpResponse } from 'msw'
import { mockTasks } from '../mocks/data/tasks'
import { mockTokens } from '../mocks/jwt-tokens'

// API endpoints to test
const TASK_API_BASE = 'http://localhost:3000/api/tasks'

// Helper to create fetch requests with auth headers
const createAuthenticatedRequest = (token: string = mockTokens.valid) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

describe('Task API Endpoints', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('GET /api/tasks/[id]', () => {
    it('should return a task by ID with valid authentication', async () => {
      const taskId = '68bab85d43e4daafab199988' // Real sample task ID
      
      const response = await fetch(`${TASK_API_BASE}/${taskId}`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result).toBeDefined()
      expect(result.entity).toBeDefined()
      
      const task = result.entity
      expect(task._id).toBe(taskId)
      expect(task.name[0].string).toBe('proovikas')
      expect(task.kaart[0].reference).toBe('68823f8b5d95233e69c29a07')
      expect(task.grupp[0].string).toBe('esimene klass')
      expect(task.vastuseid[0].number).toBe(25)
    })

    it('should return 404 for non-existent task', async () => {
      const response = await fetch(`${TASK_API_BASE}/non-existent-id`, createAuthenticatedRequest())
      
      expect(response.status).toBe(404)
      
      const error = await response.json()
      expect(error.message).toBe('Task not found')
    })

    it('should return 401 for missing authentication', async () => {
      const response = await fetch(`${TASK_API_BASE}/68bab85d43e4daafab199988`)
      
      expect(response.status).toBe(401)
      // No need to parse JSON for 401 responses with empty bodies
    })

    it('should return 401 for invalid token', async () => {
      const response = await fetch(`${TASK_API_BASE}/68bab85d43e4daafab199988`, createAuthenticatedRequest('invalid-token'))
      
      expect(response.status).toBe(401)
      // No need to parse JSON for 401 responses with empty bodies
    })

    it('should include all required entity properties', async () => {
      const response = await fetch(`${TASK_API_BASE}/68bab85d43e4daafab199988`, createAuthenticatedRequest())
      
      const result = await response.json()
      const task = result.entity
      
      // Verify Entu entity structure
      expect(task._id).toBeDefined()
      expect(task._type).toBeInstanceOf(Array)
      expect(task._type[0].string).toBe('ulesanne')
      expect(task._created).toBeInstanceOf(Array)
      expect(task._owner).toBeInstanceOf(Array)
      
      // Verify task-specific properties
      expect(task.name).toBeInstanceOf(Array)
      expect(task.name[0].string).toBeDefined()
      expect(task.kaart).toBeInstanceOf(Array)
      expect(task.kaart[0].reference).toBeDefined()
      expect(task.grupp).toBeInstanceOf(Array)
      expect(task.vastuseid).toBeInstanceOf(Array)
    })
  })

  describe('GET /api/tasks/search', () => {
    it('should return all tasks when no query provided', async () => {
      const response = await fetch(`${TASK_API_BASE}/search`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.entities).toBeInstanceOf(Array)
      expect(result.entities.length).toBeGreaterThan(0)
      expect(result.count).toBeGreaterThan(0)
      expect(result.limit).toBeDefined()
      expect(result.skip).toBeDefined()
    })

    it('should search tasks by name', async () => {
      const response = await fetch(`${TASK_API_BASE}/search?q=proovikas`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.entities).toBeInstanceOf(Array)
      expect(result.entities.length).toBeGreaterThan(0)
      
      // Should find the task with name 'proovikas'
      const foundTask = result.entities.find((task: any) => task.name[0].string.includes('proovikas'))
      expect(foundTask).toBeDefined()
      expect(foundTask._id).toBe('68bab85d43e4daafab199988')
    })

    it('should filter tasks by map (kaart)', async () => {
      const mapReference = '68823f8b5d95233e69c29a07'
      const response = await fetch(`${TASK_API_BASE}/search?kaart=${mapReference}`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.entities).toBeInstanceOf(Array)
      
      // All returned tasks should reference the specified map
      result.entities.forEach((task: any) => {
        expect(task.kaart[0].reference).toBe(mapReference)
      })
    })

    it('should filter tasks by group (grupp)', async () => {
      const groupReference = '686a6c011749f351b9c83124'
      const response = await fetch(`${TASK_API_BASE}/search?grupp=${groupReference}`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.entities).toBeInstanceOf(Array)
      
      // All returned tasks should reference the specified group
      result.entities.forEach((task: any) => {
        expect(task.grupp[0].reference).toBe(groupReference)
      })
    })

    it('should support pagination', async () => {
      const response = await fetch(`${TASK_API_BASE}/search?page=1&per_page=2`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.entities).toBeInstanceOf(Array)
      expect(result.entities.length).toBeLessThanOrEqual(2)
      expect(result.limit).toBe(2)
      expect(result.count).toBeGreaterThan(0)
    })

    it('should return empty results for non-matching search', async () => {
      const response = await fetch(`${TASK_API_BASE}/search?q=nonexistentask`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.entities).toBeInstanceOf(Array)
      expect(result.entities.length).toBe(0)
      expect(result.count).toBe(0)
    })

    it('should handle combined search and filter parameters', async () => {
      const response = await fetch(`${TASK_API_BASE}/search?q=proovikas&grupp=686a6c011749f351b9c83124`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.entities).toBeInstanceOf(Array)
      
      // Should find tasks that match both name and group
      if (result.entities.length > 0) {
        const task = result.entities[0]
        expect(task.name[0].string).toContain('proovikas')
        expect(task.grupp[0].reference).toBe('686a6c011749f351b9c83124')
      }
    })

    it('should return 401 for missing authentication', async () => {
      const response = await fetch(`${TASK_API_BASE}/search`)
      
      expect(response.status).toBe(401)
      // No need to parse JSON for 401 responses with empty bodies
    })

    it('should validate pagination parameters', async () => {
      const response = await fetch(`${TASK_API_BASE}/search?page=0&per_page=101`, createAuthenticatedRequest())
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      // Should use default values for invalid pagination
      expect(result.limit).toBeLessThanOrEqual(100)
      expect(result.skip).toBeDefined()
    })
  })

  describe('Error Scenarios', () => {
    it('should handle server errors gracefully', async () => {
      // Override the handler to return a server error
      server.use(
        http.get(`${TASK_API_BASE}/:id`, () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const response = await fetch(`${TASK_API_BASE}/68bab85d43e4daafab199988`, createAuthenticatedRequest())
      
      expect(response.status).toBe(500)
    })

    it('should handle rate limiting', async () => {
      // Override the handler to return rate limit error
      server.use(
        http.get(`${TASK_API_BASE}/search`, () => {
          return HttpResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          )
        })
      )

      const response = await fetch(`${TASK_API_BASE}/search`, createAuthenticatedRequest())
      
      expect(response.status).toBe(429)
      
      const error = await response.json()
      expect(error.error).toBe('Rate limit exceeded')
    })
  })
})
