/**
 * Tests for server/utils/logger.ts
 *
 * Thin pino wrapper — verify API shape, error handling, child logger naming
 */
import { describe, it, expect } from 'vitest'

// We import the real module — no mocking logger here since this IS the logger
import { createLogger, logger as pinoLogger } from '../../../server/utils/logger'

describe('server/utils/logger', () => {
  describe('createLogger', () => {
    it('should return an object with debug, info, warn, error methods', () => {
      const log = createLogger('test-module')
      expect(typeof log.debug).toBe('function')
      expect(typeof log.info).toBe('function')
      expect(typeof log.warn).toBe('function')
      expect(typeof log.error).toBe('function')
    })

    it('should return exactly 4 methods', () => {
      const log = createLogger('test-module')
      expect(Object.keys(log)).toHaveLength(4)
      expect(Object.keys(log).sort()).toEqual(['debug', 'error', 'info', 'warn'])
    })

    it('should not throw when calling debug with message only', () => {
      const log = createLogger('test')
      expect(() => log.debug('test message')).not.toThrow()
    })

    it('should not throw when calling info with data', () => {
      const log = createLogger('test')
      expect(() => log.info('test message', { key: 'value' })).not.toThrow()
    })

    it('should not throw when calling warn with data', () => {
      const log = createLogger('test')
      expect(() => log.warn('warning', { detail: 123 })).not.toThrow()
    })

    it('should handle error() with Error object', () => {
      const log = createLogger('test')
      const err = new Error('something broke')
      expect(() => log.error('operation failed', err)).not.toThrow()
    })

    it('should handle error() with plain value', () => {
      const log = createLogger('test')
      expect(() => log.error('operation failed', { code: 500 })).not.toThrow()
    })

    it('should handle error() with no error argument', () => {
      const log = createLogger('test')
      expect(() => log.error('operation failed')).not.toThrow()
    })

    it('should handle error() with string error', () => {
      const log = createLogger('test')
      expect(() => log.error('operation failed', 'string error')).not.toThrow()
    })

    it('should handle error() with null', () => {
      const log = createLogger('test')
      expect(() => log.error('operation failed', null)).not.toThrow()
    })

    it('should handle debug/info/warn with undefined data', () => {
      const log = createLogger('test')
      expect(() => log.debug('msg', undefined)).not.toThrow()
      expect(() => log.info('msg', undefined)).not.toThrow()
      expect(() => log.warn('msg', undefined)).not.toThrow()
    })
  })

  describe('pinoLogger export', () => {
    it('should export the base pino logger', () => {
      expect(pinoLogger).toBeDefined()
      expect(typeof pinoLogger.info).toBe('function')
      expect(typeof pinoLogger.child).toBe('function')
    })
  })
})
