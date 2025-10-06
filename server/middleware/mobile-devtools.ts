/**
 * Mobile detection middleware to prevent devtools issues
 */
export default defineEventHandler(async (event) => {
  const userAgent = getHeader(event, 'user-agent') || ''

  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  if (isMobile) {
    // Force production-like behavior for mobile
    setHeader(event, 'X-Mobile-Mode', 'true')

    // Set production environment variables
    if (process.env.NODE_ENV !== 'production') {
      // This will help prevent devtools initialization
      setHeader(event, 'X-Vue-DevTools', 'disabled')
    }
  }
})
