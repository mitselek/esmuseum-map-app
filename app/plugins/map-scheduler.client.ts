/**
 * Map Style Scheduler Plugin
 * Automatically starts the map style scheduler on app load
 * Adds console debugging commands
 */

import { useMapStyleScheduler } from '~/composables/useMapStyleScheduler'

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const { startScheduler, applyScheduledStyle, getRuleStatus } = useMapStyleScheduler()

    // Start the scheduler (checks every 5 minutes)
    startScheduler(5)

    // Expose scheduler controls to console for debugging
    const schedulerConsole = {
      checkNow: async () => {
        console.log('🔄 Manually triggering scheduler check...')
        await applyScheduledStyle()
      },

      status: async () => {
        await getRuleStatus()
      },

      help: () => {
        console.log('🗓️ Map Style Scheduler Console Commands')
        console.log('========================================')
        console.log('window.$scheduler.status()   - Show current schedule status')
        console.log('window.$scheduler.checkNow() - Manually trigger schedule check')
        console.log('window.$scheduler.help()     - Show this help')
        console.log('\n💡 Tip: The scheduler runs automatically every 5 minutes')
        console.log('💡 Use window.$map.* commands to manually override styles')
      }
    }

    // Make it globally available
    if (typeof window !== 'undefined') {
      (window as any).$scheduler = schedulerConsole

      console.log('%c🗓️ Map Style Scheduler Active', 'font-size: 14px; font-weight: bold; color: #10b981')
      console.log('%cType window.$scheduler.help() for scheduler commands', 'color: #64748b')
    }
  }
})
