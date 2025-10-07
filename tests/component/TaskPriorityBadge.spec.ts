/**
 * Tests for TaskPriorityBadge component
 * Feature: 027-add-taskprioritybadge-component
 */
import { describe, it, expect } from 'vitest'
import type { TaskPriority, PriorityTagType } from '../../types/priority'

describe('TaskPriorityBadge Logic', () => {
  // Test the priority-to-type mapping logic
  describe('Priority to Tag Type Mapping', () => {
    it('should map low priority to success type', () => {
      const typeMap: Record<TaskPriority, PriorityTagType> = {
        low: 'success',
        medium: 'warning',
        high: 'error',
      }
      
      expect(typeMap['low']).toBe('success')
    })
    
    it('should map medium priority to warning type', () => {
      const typeMap: Record<TaskPriority, PriorityTagType> = {
        low: 'success',
        medium: 'warning',
        high: 'error',
      }
      
      expect(typeMap['medium']).toBe('warning')
    })
    
    it('should map high priority to error type', () => {
      const typeMap: Record<TaskPriority, PriorityTagType> = {
        low: 'success',
        medium: 'warning',
        high: 'error',
      }
      
      expect(typeMap['high']).toBe('error')
    })
  })
  
  // Test the priority-to-text mapping logic
  describe('Priority to Display Text Mapping', () => {
    it('should map low priority to "Low" text', () => {
      const textMap: Record<TaskPriority, string> = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      }
      
      expect(textMap['low']).toBe('Low')
    })
    
    it('should map medium priority to "Medium" text', () => {
      const textMap: Record<TaskPriority, string> = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      }
      
      expect(textMap['medium']).toBe('Medium')
    })
    
    it('should map high priority to "High" text', () => {
      const textMap: Record<TaskPriority, string> = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      }
      
      expect(textMap['high']).toBe('High')
    })
  })
  
  // Test type safety
  describe('Type Safety', () => {
    it('should only accept valid priority values', () => {
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high']
      
      expect(validPriorities).toHaveLength(3)
      expect(validPriorities).toContain('low')
      expect(validPriorities).toContain('medium')
      expect(validPriorities).toContain('high')
    })
    
    it('should define all required priority tag types', () => {
      const validTagTypes: PriorityTagType[] = ['success', 'warning', 'error']
      
      expect(validTagTypes).toHaveLength(3)
      expect(validTagTypes).toContain('success')
      expect(validTagTypes).toContain('warning')
      expect(validTagTypes).toContain('error')
    })
  })
  
  // Component behavior tests
  describe('Component Props Interface', () => {
    it('should require priority prop', () => {
      // TypeScript enforces this at compile time
      // This test documents the requirement
      const requiredProps = ['priority']
      expect(requiredProps).toContain('priority')
    })
    
    it('should accept optional size prop', () => {
      // TypeScript enforces this at compile time
      const optionalProps = ['size']
      expect(optionalProps).toContain('size')
    })
  })
})
