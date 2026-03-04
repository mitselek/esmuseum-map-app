/**
 * Vue app initialization with devtools prevention
 */
export default defineNuxtPlugin({
  name: 'vue-setup',
  enforce: 'pre', // Run before other plugins
  setup () {
    // Safely disable devtools before Vue app initialization
    if (import.meta.client) {
      // Create a safe mock devtools object
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

      // Set devtools objects without making them readonly.
      // Using eslint-disable for non-standard Vue devtools window properties.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- __VUE_DEVTOOLS_GLOBAL_HOOK__ is a non-standard window property injected by Vue devtools
        ;(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = mockDevtools
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- __VUE_PROD_DEVTOOLS__ is a non-standard window property used by Vue to suppress devtools in production
        ;(window as any).__VUE_PROD_DEVTOOLS__ = false
      }
      catch {
        // Ignore if already set
      }
    }
  }
})
