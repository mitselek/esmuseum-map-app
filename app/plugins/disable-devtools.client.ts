/**
 * Disable Vue devtools on mobile to prevent hydration errors
 */
export default defineNuxtPlugin(() => {
  // Disable Vue devtools completely
  if (typeof window !== 'undefined') {
    // Simple devtools prevention
    try {
      const mockDevtools = {
        Vue: {},
        emit: () => {},
        on: () => {},
        once: () => {},
        off: () => {},
        appRecords: [],
        apps: [],
        enabled: false
      }
      
      if (!(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        ;(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = mockDevtools
      }
      
      ;(window as any).__VUE_PROD_DEVTOOLS__ = false
      
      // Suppress devtools console errors
      const originalError = console.error
      console.error = (...args: any[]) => {
        const message = String(args[0])
        if (message.includes('devtools') || 
            message.includes('__vrv_devtools') ||
            message.includes('instance.__vrv_devtools')) {
          return // Suppress devtools errors
        }
        originalError.apply(console, args)
      }
    } catch (e) {
      // Ignore errors if properties already exist
    }
  }
})
