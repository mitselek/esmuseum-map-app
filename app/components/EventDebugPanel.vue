<template>
  <div
    v-if="debugEnabled && showDebugPanel"
    class="fixed bottom-4 right-4 z-50 max-h-96 w-80 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 font-mono text-xs text-green-400 shadow-2xl"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-3 py-2">
      <span class="font-semibold text-green-300">🔍 Event Debug Panel</span>
      <div class="flex gap-1">
        <button
          class="rounded px-2 py-1 text-xs text-gray-400 hover:text-white"
          @click="clearLogs"
        >
          Clear
        </button>
        <button
          class="rounded px-2 py-1 text-xs text-gray-400 hover:text-white"
          @click="copyLogs"
        >
          Copy
        </button>
        <button
          class="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300"
          title="Disable debug mode permanently"
          @click="disableDebug"
        >
          🚫
        </button>
        <button
          class="text-gray-400 hover:text-white"
          @click="showDebugPanel = false"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Logs -->
    <div
      ref="logContainer"
      class="max-h-80 space-y-1 overflow-y-auto p-3"
    >
      <div
        v-for="(log, index) in eventLogs"
        :key="index"
        class="break-words"
      >
        <span
          class="text-yellow-300"
        >{{ log.timestamp }}</span>
        <span
          :class="getLogColor(log.type)"
        >{{ log.emoji }} {{ log.message }}</span>
        <div
          v-if="log.data"
          class="ml-4 text-xs text-gray-400"
        >
          {{ formatLogData(log.data) }}
        </div>
      </div>
    </div>

    <!-- Auto-scroll toggle -->
    <div class="flex items-center justify-between border-t border-gray-700 bg-gray-800 px-3 py-2 text-xs">
      <label class="flex items-center gap-2 text-gray-300">
        <input
          v-model="autoScroll"
          type="checkbox"
          class="rounded"
        >
        Auto-scroll
      </label>
      <span class="text-gray-500">{{ eventLogs.length }} events</span>
    </div>
  </div>

  <!-- Toggle Button (when panel is hidden) -->
  <button
    v-if="debugEnabled && !showDebugPanel"
    class="fixed bottom-4 right-4 z-50 rounded-full border border-gray-700 bg-gray-900 p-3 text-green-400 shadow-lg transition-colors hover:bg-gray-800"
    @click="showDebugPanel = true"
  >
    🔍
  </button>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

// Log entry interface
interface LogEntry {
  timestamp: string
  emoji: string
  type: 'auth' | 'event' | 'gps' | 'task' | 'map' | 'location' | 'error' | 'warn'
  message: string
  data: Record<string, unknown> | null
  level: 'log' | 'warn' | 'error'
}

// Simple boolean to control entire debug functionality
const debugEnabled = ref<boolean>(false)
// Control panel visibility
const showDebugPanel = ref<boolean>(false)
const autoScroll = ref<boolean>(true)
const eventLogs = ref<LogEntry[]>([])
const logContainer = ref<HTMLDivElement | null>(null)

// Store original console methods
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

// Log colors for different types
const LOG_COLORS: Record<LogEntry['type'], string> = {
  auth: 'text-blue-400',
  event: 'text-green-400',
  gps: 'text-purple-400',
  task: 'text-yellow-400',
  map: 'text-cyan-400',
  location: 'text-orange-400',
  error: 'text-red-400',
  warn: 'text-yellow-300'
}

const getLogColor = (type: LogEntry['type']): string => LOG_COLORS[type] || 'text-gray-300'

// Message pattern matchers: [patterns, default emoji, type]
const LOG_PATTERNS: Array<{ patterns: string[], emoji: string, type: LogEntry['type'], extractEmoji?: RegExp }> = [
  { patterns: ['🔒', 'auth'], emoji: '🔒', type: 'auth' },
  { patterns: ['🚀', '🏢', '🔍'], emoji: '🔍', type: 'event', extractEmoji: /🚀|🏢|🔍/ },
  { patterns: ['🌍', 'GPS'], emoji: '🌍', type: 'gps' },
  { patterns: ['🎯', '📋'], emoji: '📋', type: 'task', extractEmoji: /🎯|📋/ },
  { patterns: ['🗺️'], emoji: '🗺️', type: 'map' },
  { patterns: ['📍'], emoji: '📍', type: 'location' }
]

// Extract emoji and determine type from message
const parseLogMessage = (args: unknown[]): { emoji: string, type: LogEntry['type'], message: string } => {
  const message = args.join(' ')

  for (const rule of LOG_PATTERNS) {
    if (rule.patterns.some((p) => message.includes(p))) {
      const emoji = rule.extractEmoji ? (message.match(rule.extractEmoji)?.[0] || rule.emoji) : rule.emoji
      return { emoji, type: rule.type, message }
    }
  }

  return { emoji: '📋', type: 'event', message }
}

// Format log data for display
const formatLogData = (data: Record<string, unknown> | null): string => {
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data, null, 1).replace(/\n\s*/g, ' ')
  }
  return String(data)
}

// Add log entry
const addLog = (level: 'log' | 'warn' | 'error', args: unknown[]): void => {
  const parsed = parseLogMessage(args)
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })

  // Extract structured data if available
  let structuredData: Record<string, unknown> | null = null
  args.forEach((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      structuredData = arg as Record<string, unknown>
    }
  })

  eventLogs.value.push({
    timestamp,
    emoji: parsed.emoji,
    type: level === 'error' ? 'error' : level === 'warn' ? 'warn' : parsed.type,
    message: parsed.message,
    data: structuredData,
    level
  })

  // Keep only last 200 logs to prevent memory issues
  if (eventLogs.value.length > 200) {
    eventLogs.value.shift()
  }
}

// Override console methods to capture logs
const interceptConsole = (): void => {
  console.log = (...args: unknown[]) => {
    // Only capture EVENT logs, not everything
    const message = args.join(' ')
    if (message.includes('[EVENT]') || message.includes('🔒') || message.includes('🚀')
      || message.includes('🌍') || message.includes('🎯') || message.includes('🗺️')
      || message.includes('📍') || message.includes('📋') || message.includes('🏢')
      || message.includes('[CLIENT]')) {
      addLog('log', args)
    }
    originalConsoleLog(...args)
  }

  console.warn = (...args: unknown[]) => {
    addLog('warn', args)
    originalConsoleWarn(...args)
  }

  console.error = (...args: unknown[]) => {
    addLog('error', args)
    originalConsoleError(...args)
  }
}

// Restore console methods
const restoreConsole = (): void => {
  console.log = originalConsoleLog
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
}

// Auto-scroll to bottom
const scrollToBottom = (): void => {
  if (autoScroll.value && logContainer.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  }
}

// Watch for new logs and auto-scroll
watch(() => eventLogs.value.length, scrollToBottom)

// Clear logs
const clearLogs = (): void => {
  eventLogs.value = []
}

// Copy logs to clipboard
const copyLogs = async (event: Event): Promise<void> => {
  const logText = eventLogs.value.map((log) => {
    let text = `${log.timestamp} ${log.emoji} ${log.message}`
    if (log.data) {
      text += `\n  ${formatLogData(log.data)}`
    }
    return text
  }).join('\n')

  try {
    await navigator.clipboard.writeText(logText)
    // Show brief feedback
    const button = event.target as HTMLButtonElement
    const originalText = button.textContent
    button.textContent = 'Copied!'
    setTimeout(() => {
      button.textContent = originalText
    }, 1000)
  }
  catch (err) {
    console.error('Failed to copy logs:', err)
  }
}

// Disable debug mode permanently
const disableDebug = (): void => {
  localStorage.removeItem('esm_debug_enabled')
  debugEnabled.value = false
  showDebugPanel.value = false
  console.log('Debug mode disabled and removed from localStorage')
}

// Check if we should show debug panel based on URL params
onMounted(() => {
  // Check URL parameters to enable debug functionality
  const urlParams = new URLSearchParams(window.location.search)
  const hasUrlDebug = urlParams.has('debug') || urlParams.has('eventlog')

  // Also check localStorage for persistent debug mode
  const hasPersistentDebug = localStorage.getItem('esm_debug_enabled') === 'true'

  if (hasUrlDebug || hasPersistentDebug) {
    debugEnabled.value = true
    showDebugPanel.value = true
    console.log('Debug panel enabled via:', hasUrlDebug ? 'URL parameter' : 'localStorage')

    // If enabled via URL, also persist to localStorage for future visits
    if (hasUrlDebug) {
      localStorage.setItem('esm_debug_enabled', 'true')
      console.log('Debug mode persisted to localStorage')
    }
  }

  interceptConsole()

  // Add initial log only if debug panel is shown
  if (showDebugPanel.value) {
    addLog('log', ['🔍 [EVENT] Debug Panel - Initialized and capturing events'])
  }
})

onUnmounted(() => {
  restoreConsole()
})
</script>

<style scoped>
/* Custom scrollbar for the log container */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
