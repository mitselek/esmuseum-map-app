export default defineI18nConfig(() => ({
  datetimeFormats: {
    en: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }
    },
    et: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    }
  },
  detectBrowserLanguage: {
    useCookie: false
  },
  fallbackWarn: false,
  missingWarn: false,
  legacy: false,
  strategy: 'no_prefix'
}))
