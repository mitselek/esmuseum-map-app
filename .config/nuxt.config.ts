// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    https: {
      key: './localhost+3-key.pem',
      cert: './localhost+3.pem'
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    'nuxt-icons'
  ],
  ssr: false,
  devtools: { enabled: false },
  spaLoadingTemplate: false,
  // Fix mobile hydration issues
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => false
    }
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  // Disable development features that cause mobile issues
  experimental: {
    payloadExtraction: false
  },
  build: {
    analyze: false
  },
  // Configure Vite to prevent devtools issues
  vite: {
    define: {
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      __VUE_DEVTOOLS__: false
    }
  },
  runtimeConfig: {
    entuKey: '',
    public: {
      entuUrl: '',
      entuAccount: '',
      callbackOrigin: ''
    }
  },
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-09-04',
  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },
  i18n: {
    vueI18n: '~~/.config/i18n.config.ts',
    defaultLocale: 'et',
    strategy: 'no_prefix',
    locales: ['et', 'en', 'uk'],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'et'
    },
    // Disable optimization that causes mobile issues
    bundle: {
      optimizeTranslationDirective: false
    }
  },
  tailwindcss: {
    cssPath: '~/assets/tailwind.css',
    configPath: '~~/.config/tailwind.config.ts'
  }
})
