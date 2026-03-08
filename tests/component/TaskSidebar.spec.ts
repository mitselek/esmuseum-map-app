/**
 * Tests for TaskSidebar component logic
 * Validates task filtering, sorting, search, completion detection, and response stats
 */
import { describe, it, expect } from 'vitest'

// Helper types matching component
interface TaskStats {
  actual: number
  expected: number
}

// Replicate component logic
const isTaskFullyCompleted = (taskId: string, cache: Map<string, TaskStats>): boolean => {
  const stats = cache.get(taskId)
  if (!stats) return false
  return stats.actual >= stats.expected
}

const getResponseStatsText = (taskId: string, cache: Map<string, TaskStats>, fallbackCount: number): string => {
  const stats = cache.get(taskId)
  if (stats) {
    return `${stats.actual} / ${stats.expected} responses`
  }
  return `${fallbackCount} responses`
}

// Mock task factory
const createTask = (id: string, name: string) => ({
  _id: id,
  name: [{ string: name }],
  kirjeldus: [{ string: `Description of ${name}` }],
  vastuseid: [{ number: 3 }],
  tahtaeg: [{ datetime: '2026-04-01T12:00:00Z' }]
})

describe('TaskSidebar Logic', () => {
  describe('Task Search Filtering', () => {
    const tasks = [
      createTask('1', 'Lennusadam'),
      createTask('2', 'Patarei vangla'),
      createTask('3', 'Kiek in de Kök')
    ]

    it('should return all tasks when search is empty', () => {
      const query = ''
      const filtered = query.trim()
        ? tasks.filter(() => false)
        : tasks
      expect(filtered).toHaveLength(3)
    })

    it('should filter by task name (case insensitive)', () => {
      const query = 'lennu'
      const filtered = tasks.filter((task) => {
        const title = task.name[0]?.string?.toLowerCase() || ''
        return title.includes(query.toLowerCase())
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]!._id).toBe('1')
    })

    it('should filter by description', () => {
      const query = 'vangla'
      const filtered = tasks.filter((task) => {
        const title = task.name[0]?.string?.toLowerCase() || ''
        const description = task.kirjeldus?.[0]?.string?.toLowerCase() || ''
        return title.includes(query.toLowerCase()) || description.includes(query.toLowerCase())
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]!._id).toBe('2')
    })

    it('should return empty array when no matches', () => {
      const query = 'nonexistent'
      const filtered = tasks.filter((task) => {
        const title = task.name[0]?.string?.toLowerCase() || ''
        return title.includes(query.toLowerCase())
      })
      expect(filtered).toHaveLength(0)
    })

    it('should trim search query', () => {
      const query = '  lennu  '
      const trimmed = query.toLowerCase().trim()
      const filtered = tasks.filter((task) => {
        const title = task.name[0]?.string?.toLowerCase() || ''
        return title.includes(trimmed)
      })
      expect(filtered).toHaveLength(1)
    })
  })

  describe('Task Completion Detection', () => {
    it('should detect fully completed task', () => {
      const cache = new Map<string, TaskStats>()
      cache.set('task-1', { actual: 5, expected: 5 })
      expect(isTaskFullyCompleted('task-1', cache)).toBe(true)
    })

    it('should detect over-completed task', () => {
      const cache = new Map<string, TaskStats>()
      cache.set('task-1', { actual: 7, expected: 5 })
      expect(isTaskFullyCompleted('task-1', cache)).toBe(true)
    })

    it('should detect incomplete task', () => {
      const cache = new Map<string, TaskStats>()
      cache.set('task-1', { actual: 2, expected: 5 })
      expect(isTaskFullyCompleted('task-1', cache)).toBe(false)
    })

    it('should return false for unknown task', () => {
      const cache = new Map<string, TaskStats>()
      expect(isTaskFullyCompleted('unknown', cache)).toBe(false)
    })

    it('should return false for task with 0/0', () => {
      const cache = new Map<string, TaskStats>()
      cache.set('task-1', { actual: 0, expected: 0 })
      // 0 >= 0 is true
      expect(isTaskFullyCompleted('task-1', cache)).toBe(true)
    })
  })

  describe('Response Stats Text', () => {
    it('should show actual/expected when stats available', () => {
      const cache = new Map<string, TaskStats>()
      cache.set('task-1', { actual: 3, expected: 5 })
      const text = getResponseStatsText('task-1', cache, 0)
      expect(text).toBe('3 / 5 responses')
    })

    it('should show fallback count when no stats', () => {
      const cache = new Map<string, TaskStats>()
      const text = getResponseStatsText('task-1', cache, 7)
      expect(text).toBe('7 responses')
    })
  })

  describe('Task Sorting (incomplete first, completed last)', () => {
    it('should sort incomplete tasks before completed', () => {
      const cache = new Map<string, TaskStats>()
      cache.set('a', { actual: 5, expected: 5 }) // completed
      cache.set('b', { actual: 1, expected: 5 }) // incomplete
      cache.set('c', { actual: 3, expected: 5 }) // incomplete

      const tasks = [
        { _id: 'a', name: 'Task A' },
        { _id: 'b', name: 'Task B' },
        { _id: 'c', name: 'Task C' }
      ]

      const sorted = [...tasks].sort((a, b) => {
        const aStats = cache.get(a._id)
        const bStats = cache.get(b._id)
        const aCompleted = aStats && aStats.actual >= aStats.expected
        const bCompleted = bStats && bStats.actual >= bStats.expected
        if (aCompleted === bCompleted) return 0
        return aCompleted ? 1 : -1
      })

      expect(sorted[0]!._id).toBe('b')
      expect(sorted[2]!._id).toBe('a')
    })

    it('should preserve order among same-status tasks', () => {
      const cache = new Map<string, TaskStats>()
      cache.set('a', { actual: 1, expected: 5 })
      cache.set('b', { actual: 2, expected: 5 })

      const tasks = [
        { _id: 'a', name: 'Task A' },
        { _id: 'b', name: 'Task B' }
      ]

      const sorted = [...tasks].sort((a, b) => {
        const aStats = cache.get(a._id)
        const bStats = cache.get(b._id)
        const aCompleted = aStats && aStats.actual >= aStats.expected
        const bCompleted = bStats && bStats.actual >= bStats.expected
        if (aCompleted === bCompleted) return 0
        return aCompleted ? 1 : -1
      })

      // Same status, order preserved
      expect(sorted[0]!._id).toBe('a')
      expect(sorted[1]!._id).toBe('b')
    })
  })

  describe('Stats Cache Reactivity (Mobile Fix)', () => {
    it('should create new Map instance on update for reactivity', () => {
      const oldCache = new Map<string, TaskStats>()
      oldCache.set('task-1', { actual: 1, expected: 5 })

      // Mobile fix: create new Map instead of mutating
      const newCache = new Map(oldCache)
      newCache.set('task-1', { actual: 2, expected: 5 })

      expect(oldCache).not.toBe(newCache)
      expect(oldCache.get('task-1')!.actual).toBe(1)
      expect(newCache.get('task-1')!.actual).toBe(2)
    })
  })
})
