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
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    'nuxt-icons'
  ],
  ssr: false,
  devtools: { enabled: false },
  spaLoadingTemplate: false,
  runtimeConfig: {
    entuKey: '',
    public: {
      entuUrl: ''
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
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'et'
    }
  },
  scripts: {
    registry: {
      plausibleAnalytics: { domain: 'plugins.entu.app' }
    }
  },
  tailwindcss: {
    cssPath: '~/assets/tailwind.css',
    configPath: '~~/.config/tailwind.config.ts'
  }
})
