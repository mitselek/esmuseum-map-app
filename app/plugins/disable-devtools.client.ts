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

      // Note: Using 'as any' to augment window object with non-standard Vue devtools globals
      // These properties are not defined in standard Window interface but are used by Vue devtools
      // This is the standard pattern for disabling devtools in production environments
      if (!(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        ;(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = mockDevtools
      }

      ;(window as any).__VUE_PROD_DEVTOOLS__ = false

      // Suppress devtools console errors
      const originalError = console.error
      // Constitutional: Console args use unknown[] for flexible error message handling
      // Console.error accepts any number and type of arguments for debugging flexibility
      // Principle I: Type Safety First - documented exception for console utility
      console.error = (...args: unknown[]) => {
        const message = String(args[0])
        if (message.includes('devtools')
          || message.includes('__vrv_devtools')
          || message.includes('instance.__vrv_devtools')) {
          return // Suppress devtools errors
        }
        originalError.apply(console, args)
      }
    }
    catch (e) {
      // Ignore errors if properties already exist
    }
  }
})
