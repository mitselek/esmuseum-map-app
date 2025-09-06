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
 * Create a formatted log message with timestamp, level, and module
 */
function formatLogMessage(level: LogLevel, module: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString()
  let logMessage = `[${timestamp}] [${level}] [${module}] ${message}`
  
  if (data) {
    try {
      // Try to stringify the data, or just convert to string if not possible
      const dataStr = typeof data === 'object' 
        ? JSON.stringify(data, null, 2)
        : String(data)
      
      logMessage += `\n${dataStr}`
    } catch (err) {
      logMessage += `\n[Failed to stringify data: ${err}]`
    }
  }
  
  return logMessage
}

/**
 * Create a logger for a specific module
 */
export function createLogger(moduleName: string) {
  return {
    debug: (message: string, data?: any) => {
      console.log(formatLogMessage(LogLevel.DEBUG, moduleName, message, data))
    },
    
    info: (message: string, data?: any) => {
      console.log(formatLogMessage(LogLevel.INFO, moduleName, message, data))
    },
    
    warn: (message: string, data?: any) => {
      console.warn(formatLogMessage(LogLevel.WARN, moduleName, message, data))
    },
    
    error: (message: string, error?: any) => {
      console.error(formatLogMessage(LogLevel.ERROR, moduleName, message, error))
    }
  }
}
