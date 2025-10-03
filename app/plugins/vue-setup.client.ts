/**
 * Vue app initialization with devtools prevention
 */
export default defineNuxtPlugin({
  name: 'vue-setup',
  enforce: 'pre', // Run before other plugins
  setup() {
    // Safely disable devtools before Vue app initialization
    if (process.client) {
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
      
      // Set devtools objects without making them readonly
      // Note: Using 'as any' to augment window object with non-standard Vue devtools globals
      // These properties are not defined in standard Window interface but are used by Vue devtools
      // This is the standard pattern for controlling devtools behavior in production
      try {
        (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = mockDevtools
        ;(window as any).__VUE_PROD_DEVTOOLS__ = false
      } catch (e) {
        // Ignore if already set
      }
    }
  }
})
