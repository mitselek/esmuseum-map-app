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

      // Note: Using eslint-disable to augment window object with non-standard Vue devtools globals.
      // These properties are not defined in the standard Window interface but are used by Vue devtools.
      // This is the standard pattern for disabling devtools in production environments.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- __VUE_DEVTOOLS_GLOBAL_HOOK__ is a non-standard window property injected by Vue devtools
      if (!(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- __VUE_DEVTOOLS_GLOBAL_HOOK__ is a non-standard window property injected by Vue devtools
        ;(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = mockDevtools
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- __VUE_PROD_DEVTOOLS__ is a non-standard window property used by Vue to suppress devtools in production
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
    catch {
      // Ignore errors if properties already exist
    }
  }
})
