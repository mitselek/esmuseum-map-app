<template>
  <div
    v-if="showDebugPanel"
    class="fixed bottom-4 right-4 z-50 max-h-96 w-80 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 font-mono text-xs text-green-400 shadow-2xl"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-3 py-2">
      <span class="font-semibold text-green-300">🔍 Event Debug Panel</span>
      <div class="flex gap-2">
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
    v-if="!showDebugPanel"
    class="fixed bottom-4 right-4 z-50 rounded-full border border-gray-700 bg-gray-900 p-3 text-green-400 shadow-lg transition-colors hover:bg-gray-800"
    @click="showDebugPanel = true"
  >
    🔍
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

// Check URL for debug parameter to control panel visibility
const showDebugPanel = ref(
  import.meta.client && (() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.has('debug') || urlParams.has('eventlog')
  })()
)
const autoScroll = ref(true)
const eventLogs = ref([])
const logContainer = ref(null)

// Store original console methods
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

// Log colors for different types
const getLogColor = (type) => {
  switch (type) {
    case 'auth': return 'text-blue-400'
    case 'event': return 'text-green-400'
    case 'gps': return 'text-purple-400'
    case 'task': return 'text-yellow-400'
    case 'map': return 'text-cyan-400'
    case 'location': return 'text-orange-400'
    case 'error': return 'text-red-400'
    case 'warn': return 'text-yellow-300'
    default: return 'text-gray-300'
  }
}

// Extract emoji and determine type from message
const parseLogMessage = (args) => {
  const message = args.join(' ')
  let emoji = '📋'
  let type = 'event'

  if (message.includes('🔒') || message.includes('auth')) {
    emoji = '🔒'
    type = 'auth'
  }
  else if (message.includes('🚀') || message.includes('🏢') || message.includes('🔍')) {
    emoji = message.match(/🚀|🏢|🔍/)?.[0] || '🔍'
    type = 'event'
  }
  else if (message.includes('🌍') || message.includes('GPS')) {
    emoji = '🌍'
    type = 'gps'
  }
  else if (message.includes('🎯') || message.includes('📋')) {
    emoji = message.match(/🎯|📋/)?.[0] || '📋'
    type = 'task'
  }
  else if (message.includes('🗺️')) {
    emoji = '🗺️'
    type = 'map'
  }
  else if (message.includes('📍')) {
    emoji = '📍'
    type = 'location'
  }

  return { emoji, type, message }
}

// Format log data for display
const formatLogData = (data) => {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 1).replace(/\n\s*/g, ' ')
  }
  return String(data)
}

// Add log entry
const addLog = (level, args) => {
  const parsed = parseLogMessage(args)
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })

  // Extract structured data if available
  let structuredData = null
  args.forEach((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      structuredData = arg
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
const interceptConsole = () => {
  console.log = (...args) => {
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

  console.warn = (...args) => {
    addLog('warn', args)
    originalConsoleWarn(...args)
  }

  console.error = (...args) => {
    addLog('error', args)
    originalConsoleError(...args)
  }
}

// Restore console methods
const restoreConsole = () => {
  console.log = originalConsoleLog
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
}

// Auto-scroll to bottom
const scrollToBottom = () => {
  if (autoScroll.value && logContainer.value) {
    nextTick(() => {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    })
  }
}

// Watch for new logs and auto-scroll
watch(() => eventLogs.value.length, scrollToBottom)

// Clear logs
const clearLogs = () => {
  eventLogs.value = []
}

// Copy logs to clipboard
const copyLogs = async () => {
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
    const button = event.target
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

// Check if we should show debug panel based on URL params
onMounted(() => {
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
