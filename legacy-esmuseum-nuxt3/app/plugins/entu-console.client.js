/**
 * Plugin to expose Entu API functionality to the browser console for debugging
 */

export default defineNuxtPlugin(() => {
  // Only run in client and development mode
  if (import.meta.client && import.meta.dev) {
    // Create a global object for Entu API functions
    const entuConsole = {}

    // Setup function to initialize API when needed
    entuConsole.init = () => {
      const {
        getAccountInfo,
        getEntityTypes,
        getEntitiesByType,
        getEntity,
        searchEntities
      } = useEntuApi()

      // Add all the API methods to the global object
      entuConsole.getAccountInfo = async () => {
        try {
          const result = await getAccountInfo()
          console.log('Account info:', result)
          return result
        }
        catch (error) {
          console.error('Error fetching account info:', error)
          throw error
        }
      }

      entuConsole.getEntityTypes = async () => {
        try {
          const result = await getEntityTypes()
          console.log('Entity types:', result)
          return result
        }
        catch (error) {
          console.error('Error fetching entity types:', error)
          throw error
        }
      }

      entuConsole.getEntitiesByType = async (type, props = null, limit = 100) => {
        try {
          const result = await getEntitiesByType(type, props, limit)
          console.log(`Entities of type ${type}:`, result)
          return result
        }
        catch (error) {
          console.error(`Error fetching entities of type ${type}:`, error)
          throw error
        }
      }

      entuConsole.getEntity = async (entityId) => {
        try {
          const result = await getEntity(entityId)
          console.log(`Entity ${entityId}:`, result)
          return result
        }
        catch (error) {
          console.error(`Error fetching entity ${entityId}:`, error)
          throw error
        }
      }

      entuConsole.searchEntities = async (query) => {
        try {
          const result = await searchEntities(query)
          console.log('Search results:', result)
          return result
        }
        catch (error) {
          console.error('Error searching entities:', error)
          throw error
        }
      }

      console.log('Entu API console helpers initialized. Available methods:')
      console.log('- entu.getAccountInfo()')
      console.log('- entu.getEntityTypes()')
      console.log('- entu.getEntitiesByType(type, props, limit)')
      console.log('- entu.getEntity(entityId)')
      console.log('- entu.searchEntities(query)')
      console.log('- entu.getAuthResponse() - Get the complete auth response from localStorage')

      return 'Entu API console helpers initialized'
    }

    // Make it globally available
    window.entu = entuConsole

    // Auto-initialize in development for convenience
    if (import.meta.dev) {
      console.log('🌐 Entu API console access available via window.entu')
      console.log('Run entu.init() to initialize all API methods')

      // Add quick access methods directly (no init needed)
      entuConsole.quickInfo = async () => {
        // Initialize if needed
        if (!entuConsole.getAccountInfo) {
          entuConsole.init()
        }

        try {
          // Get account info and entity types in parallel
          const [accountInfo, entityTypes] = await Promise.all([
            entuConsole.getAccountInfo(),
            entuConsole.getEntityTypes()
          ])

          console.group('Entu Quick Info')
          console.log('Account:', accountInfo)
          console.log('Entity Types:', entityTypes.entities?.length || 0)
          console.groupEnd()

          return { accountInfo, entityTypes }
        }
        catch (error) {
          console.error('Error fetching quick info:', error)
          throw error
        }
      }

      // We'll use localStorage directly for the auth response
      entuConsole.getAuthResponse = () => {
        try {
          const storedAuthResponse = localStorage.getItem('esm_auth_response')
          if (storedAuthResponse) {
            const response = JSON.parse(storedAuthResponse)
            console.log('Auth Response:', response)
            return response
          }
          else {
            console.warn('No auth response found. You might need to log in first.')
            return null
          }
        }
        catch (error) {
          console.error('Error reading auth response:', error)
          return null
        }
      }

      // Add command hints
      console.log('Try entu.quickInfo() for a summary of account data')
      console.log('Try entu.getAuthResponse() to view the complete auth response from localStorage')
    }
  }
})
