/**
 * Server-side logging utility
 * Provides consistent logging format and levels for server-side code
 */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Check if we should log at this level
 */
function shouldLog(level: LogLevel): boolean {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Always log WARN and ERROR in any environment
  if (level === LogLevel.WARN || level === LogLevel.ERROR) {
    return true
  }
  
  // In development, also log INFO
  if (isDev && level === LogLevel.INFO) {
    return true
  }
  
  // Never log DEBUG
  return false
}

/**
 * Create a formatted log message with timestamp, level, and module
 */
function formatLogMessage (level: LogLevel, module: string, message: string): string {
  const timestamp = new Date().toISOString().substring(11, 19) // Just time, not full date
  return `[${timestamp}] [${module}] ${message}`
}

/**
 * Create a logger for a specific module
 */
export function createLogger (moduleName: string) {
  return {
    debug: (message: string, data?: any) => {
      // Debug logs are completely disabled
    },

    info: (message: string, data?: any) => {
      if (shouldLog(LogLevel.INFO)) {
        console.log(formatLogMessage(LogLevel.INFO, moduleName, message))
      }
    },

    warn: (message: string, data?: any) => {
      if (shouldLog(LogLevel.WARN)) {
        console.warn(formatLogMessage(LogLevel.WARN, moduleName, message))
      }
    },

    error: (message: string, error?: any) => {
      if (shouldLog(LogLevel.ERROR)) {
        const errorMsg = error?.message || error?.statusMessage || String(error || '')
        console.error(formatLogMessage(LogLevel.ERROR, moduleName, `${message}: ${errorMsg}`))
      }
    }
  }
}
