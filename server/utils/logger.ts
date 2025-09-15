/**
 * Server-side logging utility
 * Provides consistent logging format and levels for server-side code
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Get the current log level from environment or default
 */
function getCurrentLogLevel(): LogLevel {
  const envLogLevel = process.env.LOG_LEVEL?.toUpperCase()
  const isDev = process.env.NODE_ENV === 'development'
  
  switch (envLogLevel) {
    case 'DEBUG': return LogLevel.DEBUG
    case 'INFO': return LogLevel.INFO
    case 'WARN': return LogLevel.WARN
    case 'ERROR': return LogLevel.ERROR
    default:
      // Default: INFO in production for API debugging, DEBUG in development
      return isDev ? LogLevel.DEBUG : LogLevel.INFO
  }
}

/**
 * Check if we should log at this level
 */
function shouldLog(level: LogLevel): boolean {
  return level >= getCurrentLogLevel()
}

/**
 * Create a formatted log message with timestamp, level, and module
 */
function formatLogMessage (level: LogLevel, module: string, message: string): string {
  const timestamp = new Date().toISOString().substring(11, 19) // Just time, not full date
  const levelName = LogLevel[level]
  return `[${timestamp}] [${levelName}] [${module}] ${message}`
}

/**
 * Format data object for logging
 */
function formatData(data?: any): string {
  if (!data) return ''
  
  try {
    if (typeof data === 'string') return ` - ${data}`
    if (typeof data === 'object') {
      const jsonStr = JSON.stringify(data, null, 2)
      return ` - ${jsonStr}`
    }
    return ` - ${String(data)}`
  } catch (e) {
    return ` - [Object could not be serialized]`
  }
}

/**
 * Create a logger for a specific module
 */
export function createLogger (moduleName: string) {
  return {
    debug: (message: string, data?: any) => {
      if (shouldLog(LogLevel.DEBUG)) {
        console.log(formatLogMessage(LogLevel.DEBUG, moduleName, message) + formatData(data))
      }
    },

    info: (message: string, data?: any) => {
      if (shouldLog(LogLevel.INFO)) {
        console.log(formatLogMessage(LogLevel.INFO, moduleName, message) + formatData(data))
      }
    },

    warn: (message: string, data?: any) => {
      if (shouldLog(LogLevel.WARN)) {
        console.warn(formatLogMessage(LogLevel.WARN, moduleName, message) + formatData(data))
      }
    },

    error: (message: string, error?: any) => {
      if (shouldLog(LogLevel.ERROR)) {
        const errorMsg = error?.message || error?.statusMessage || String(error || '')
        console.error(formatLogMessage(LogLevel.ERROR, moduleName, `${message}: ${errorMsg}`) + formatData(error))
      }
    }
  }
}
