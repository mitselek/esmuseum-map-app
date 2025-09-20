// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-09-20',
  devtools: { enabled: true },
  
  // Set custom source directory
  srcDir: 'app/',
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    ['@nuxtjs/i18n', {
      defaultLocale: 'et',
      locales: [
        { code: 'et', name: 'Eesti', file: 'et.json' },
        { code: 'uk', name: 'Українська', file: 'uk.json' },
        { code: 'en-GB', name: 'English', file: 'en-GB.json' }
      ],
      lazy: true,
      langDir: '../locales/',
      strategy: 'no_prefix',
      detectBrowserLanguage: {
        useCookie: true,
        cookieKey: 'esmuseum-language',
        alwaysRedirect: false,
        fallbackLocale: 'et',
        redirectOn: 'root'
      }
    }]
  ],
  
  // HTTPS development server configuration
  devServer: {
    https: {
      key: './localhost+3-key.pem',
      cert: './localhost+3.pem'
    }
  },

  // Watch configuration - exclude legacy directory and reduce file watching
  watch: ['~/components/**', '~/composables/**', '~/pages/**', '~/layouts/**'],
  ignore: [
    'legacy-esmuseum-nuxt3/**', 
    'legacy-esmuseum-nuxt3',
    '.nuxt/dev/**',
    '.nuxt/dist/**', 
    '.output/**',
    'node_modules/**'
  ],
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true // Re-enabled after fixing useI18n import issue
  },

  // CSS framework (Tailwind CSS)
  css: [
    '~/assets/css/main.css'
  ],

  // Runtime config for environment variables
  runtimeConfig: {
    // Entu API configuration (server-side only)
    entuApiUrl: process.env.NUXT_ENTU_API_URL,
    
    // Public keys (exposed to client-side)
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://localhost:3000',
      entuApiUrl: process.env.NUXT_ENTU_API_URL || 'https://api.entu.ee',
      entuClientId: process.env.NUXT_ENTU_CLIENT_ID
    }
  },

  // Nitro configuration for cleaner builds
  nitro: {
    // Reduce file watching in development
    dev: process.env.NODE_ENV === 'development',
    // Suppress known warnings
    logLevel: 1
  },

  // Vite configuration for cleaner builds
  vite: {
    // Suppress rollup warnings for known issues
    build: {
      rollupOptions: {
        external: (id: string) => {
          // Treat Nuxt internal modules as external
          if (id.includes('@nuxt/vite-builder')) return true
          return false
        }
      }
    }
  }
})