// Navigation tracker plugin to catch URL changes
export default defineNuxtPlugin(() => {
  // Track all router navigation
  const router = useRouter()
  
  // Track programmatic navigation
  const originalPush = router.push
  const originalReplace = router.replace
  
  router.push = function (...args) {
    console.log('🔄 [NAVIGATION] router.push called', {
      timestamp: new Date().toISOString(),
      args,
      currentRoute: router.currentRoute.value.fullPath,
      stackTrace: new Error().stack?.split('\n').slice(0, 5)
    })
    return originalPush.apply(this, args)
  }
  
  router.replace = function (...args) {
    console.log('🔄 [NAVIGATION] router.replace called', {
      timestamp: new Date().toISOString(),
      args,
      currentRoute: router.currentRoute.value.fullPath,
      stackTrace: new Error().stack?.split('\n').slice(0, 5)
    })
    return originalReplace.apply(this, args)
  }
  
  // Track navigateTo calls
  if (window.navigateTo) {
    const originalNavigateTo = window.navigateTo
    window.navigateTo = function (...args) {
      console.log('🔄 [NAVIGATION] navigateTo called', {
        timestamp: new Date().toISOString(),
        args,
        currentRoute: router.currentRoute.value.fullPath,
        stackTrace: new Error().stack?.split('\n').slice(0, 5)
      })
      return originalNavigateTo.apply(this, args)
    }
  }
  
  // Track route changes
  router.beforeEach((to, from) => {
    console.log('🔄 [NAVIGATION] Route change', {
      timestamp: new Date().toISOString(),
      from: from.fullPath,
      to: to.fullPath,
      hasDebugBefore: from.query.debug !== undefined,
      hasDebugAfter: to.query.debug !== undefined,
      queryChanges: {
        removed: Object.keys(from.query).filter((key) => !(key in to.query)),
        added: Object.keys(to.query).filter((key) => !(key in from.query))
      }
    })
  })
  
  // Track history changes
  const originalPushState = window.history.pushState
  const originalReplaceState = window.history.replaceState
  
  window.history.pushState = function (...args) {
    console.log('🔄 [NAVIGATION] history.pushState', {
      timestamp: new Date().toISOString(),
      args,
      currentURL: window.location.href,
      stackTrace: new Error().stack?.split('\n').slice(0, 5)
    })
    return originalPushState.apply(this, args)
  }
  
  window.history.replaceState = function (...args) {
    console.log('🔄 [NAVIGATION] history.replaceState', {
      timestamp: new Date().toISOString(),
      args,
      currentURL: window.location.href,
      stackTrace: new Error().stack?.split('\n').slice(0, 5)
    })
    return originalReplaceState.apply(this, args)
  }
  
  // Track window.location changes
  window.addEventListener('popstate', (event) => {
    console.log('🔄 [NAVIGATION] popstate event', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      state: event.state
    })
  })
  
  // Monitor URL changes with a simple watcher
  let lastURL = window.location.href
  setInterval(() => {
    if (window.location.href !== lastURL) {
      console.log('🔄 [NAVIGATION] URL changed (polling detection)', {
        timestamp: new Date().toISOString(),
        from: lastURL,
        to: window.location.href,
        hasDebugBefore: lastURL.includes('debug'),
        hasDebugAfter: window.location.href.includes('debug')
      })
      lastURL = window.location.href
    }
  }, 100) // Check every 100ms
  
  console.log('🔄 [NAVIGATION] Navigation tracker initialized')
})
