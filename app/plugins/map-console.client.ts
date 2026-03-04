/* eslint-disable no-console */
/**
 * Map Console Easter Egg Plugin
 * Exposes map style controls to browser console for experimentation
 *
 * Usage in browser console:
 * - window.$map.listStyles()        // Show all available styles
 * - window.$map.setStyle('vintage') // Switch to vintage style
 * - window.$map.currentStyle()      // Show current style
 */

import { useMapStyles } from '~/composables/useMapStyles'

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const { setStyle, listStyles, getCurrentStyle } = useMapStyles()

    // Expose map controls to window object
    const mapConsole = {
      setStyle: (styleId: string) => {
        return setStyle(styleId)
      },

      listStyles: () => {
        listStyles()
      },

      currentStyle: () => {
        const style = getCurrentStyle.value
        if (style) {
          console.log(`🗺️ Current style: ${style.name}`)
          console.log(`   ${style.description}`)
          return style
        }
        return null
      },

      help: () => {
        console.log('🎨 ESMuseum Map Console Commands')
        console.log('=================================')
        console.log('window.$map.listStyles()        - Show all available map styles')
        console.log('window.$map.setStyle("id")      - Switch to a different style')
        console.log('window.$map.currentStyle()      - Show current active style')
        console.log('window.$map.help()              - Show this help')
        console.log('\n💡 Try: window.$map.setStyle("vintage")')
      }
    }

    // Make it globally available
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- $map is a custom developer console property not in the standard Window interface
      ;(window as any).$map = mapConsole

      // Welcome message for developers
      console.log('%c🗺️ ESMuseum Map Controls', 'font-size: 16px; font-weight: bold; color: #2563eb')
      console.log('%cType window.$map.help() for map style commands', 'color: #64748b')
    }
  }
})
