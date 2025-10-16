/**
 * Structured logging with Pino
 *
 * Provides consistent, structured logging across the application.
 * - Development: Pretty-printed colorized output
 * - Production: JSON logs for parsing and analysis
 *
 * Usage:
 *   const log = createLogger('webhook')
 *   log.info('User logged in', { userId: '123', email: 'user@example.com' })
 *   log.error({ err: error, context: {...} }, 'API call failed')
 */

import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

// Configure Pino logger
const pinoLogger = pino({
  // Log level: debug in dev, info in production
  level: isDevelopment ? 'debug' : 'info',

  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '[{module}] {msg}'
        }
      }
    : undefined,

  // ISO timestamps for production
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base context for all logs
  base: {
    env: process.env.NODE_ENV || 'development'
  },

  // Format level as string
  formatters: {
    level: (label) => {
      return { level: label }
    }
  }
})

/**
 * Create a logger for a specific module
 * Maintains backward compatibility with existing logger interface
 *
 * Constitutional: Logger data parameters use `any` for maximum flexibility
 * This is a debugging utility that should accept any data type without friction.
 * The logger safely serializes all types (Pino handles this internally).
 * Principle I: Type Safety First - documented exception for debugging utilities
 * where strict typing would hinder developer experience without safety benefit.
 *
 * @param moduleName - Module identifier (e.g., 'webhook', 'entu-admin')
 * @returns Logger instance with debug, info, warn, error methods
 */
export function createLogger (moduleName: string) {
  const log = pinoLogger.child({ module: moduleName })

  return {
    /**
     * Debug level logging - development only
     */
    debug: (message: string, data?: any) => {
      log.debug(data || {}, message)
    },

    /**
     * Info level logging - general information
     */
    info: (message: string, data?: any) => {
      log.info(data || {}, message)
    },

    /**
     * Warning level logging - potential issues
     */
    warn: (message: string, data?: any) => {
      log.warn(data || {}, message)
    },

    /**
     * Error level logging - critical issues
     * @param message - Error message
     * @param error - Error object or any value
     */
    error: (message: string, error?: any) => {
      if (error instanceof Error) {
        log.error({ err: error }, message)
      }
      else if (error) {
        log.error({ error }, message)
      }
      else {
        log.error(message)
      }
    }
  }
}

// Export default logger for advanced usage
export const logger = pinoLogger
