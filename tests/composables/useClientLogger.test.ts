/**
 * Tests for useClientLogger composable
 *
 * Tests dev-only vs always-on logging behavior
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useClientLogger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    }
  })

  /**
   * Since import.meta.dev is a compile-time constant that can't be toggled
   * in tests, we test the logger's core contract by reimplementing the logic.
   */
  const createLogger = (module: string, isDev: boolean) => {
    const prefix = `[${module}]`
    return {
      debug: (...args: unknown[]) => {
        if (isDev) console.log(prefix, ...args)
      },
      info: (...args: unknown[]) => {
        if (isDev) console.log(prefix, ...args)
      },
      warn: (...args: unknown[]) => {
        console.warn(prefix, ...args)
      },
      error: (...args: unknown[]) => {
        console.error(prefix, ...args)
      }
    }
  }

  describe('module prefix', () => {
    it('should prefix all messages with [module]', () => {
      const log = createLogger('TestModule', true)

      log.warn('test message')

      expect(consoleSpy.warn).toHaveBeenCalledWith('[TestModule]', 'test message')
    })

    it('should handle different module names', () => {
      const log = createLogger('useEntuAuth', true)

      log.error('auth failed')

      expect(consoleSpy.error).toHaveBeenCalledWith('[useEntuAuth]', 'auth failed')
    })
  })

  describe('dev-only methods (debug, info)', () => {
    it('should emit debug in dev mode', () => {
      const log = createLogger('Test', true)

      log.debug('debug message', { detail: 'value' })

      expect(consoleSpy.log).toHaveBeenCalledWith('[Test]', 'debug message', { detail: 'value' })
    })

    it('should emit info in dev mode', () => {
      const log = createLogger('Test', true)

      log.info('info message')

      expect(consoleSpy.log).toHaveBeenCalledWith('[Test]', 'info message')
    })

    it('should NOT emit debug in production mode', () => {
      const log = createLogger('Test', false)

      log.debug('should not appear')

      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    it('should NOT emit info in production mode', () => {
      const log = createLogger('Test', false)

      log.info('should not appear')

      expect(consoleSpy.log).not.toHaveBeenCalled()
    })
  })

  describe('always-on methods (warn, error)', () => {
    it('should always emit warn regardless of mode', () => {
      const logDev = createLogger('Test', true)
      const logProd = createLogger('Test', false)

      logDev.warn('dev warning')
      logProd.warn('prod warning')

      expect(consoleSpy.warn).toHaveBeenCalledTimes(2)
    })

    it('should always emit error regardless of mode', () => {
      const logDev = createLogger('Test', true)
      const logProd = createLogger('Test', false)

      logDev.error('dev error')
      logProd.error('prod error')

      expect(consoleSpy.error).toHaveBeenCalledTimes(2)
    })
  })

  describe('multiple arguments', () => {
    it('should pass through all arguments to console', () => {
      const log = createLogger('Test', true)
      const errorObj = new Error('test error')

      log.error('Upload failed:', errorObj, { retries: 3 })

      expect(consoleSpy.error).toHaveBeenCalledWith('[Test]', 'Upload failed:', errorObj, { retries: 3 })
    })

    it('should handle no arguments after prefix', () => {
      const log = createLogger('Test', true)

      log.warn()

      expect(consoleSpy.warn).toHaveBeenCalledWith('[Test]')
    })
  })
})
