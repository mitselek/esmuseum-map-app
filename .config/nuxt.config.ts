// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
    discogsKey: '',
    entuKey: '',
    public: {
      entuUrl: '',
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
    vueI18n: '~~/.config/i18n.config.ts'
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
