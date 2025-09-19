// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Modules
  modules: [
    '@nuxt/test-utils/module'
  ],

  // CSS framework (Tailwind CSS)
  css: [
    '~/assets/css/main.css'
  ],

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    
    // Entu API configuration
    entuApiUrl: process.env.NUXT_ENTU_API_URL,
    entuClientId: process.env.NUXT_ENTU_CLIENT_ID,
    
    // Public keys (exposed to client-side)
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },

  // Vitest configuration  
  vite: {
    test: {
      // Enable Vitest for testing
    }
  }
})