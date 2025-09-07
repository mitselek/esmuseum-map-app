/**
 * Client-side i18n persistence plugin
 * Ensures language selection persists across page navigations in SPA mode
 */

export default defineNuxtPlugin(() => {
  const { $i18n } = useNuxtApp()
  
  // Restore language from localStorage on app initialization
  const savedLocale = localStorage.getItem('app_locale')
  if (savedLocale && ['et', 'en', 'uk'].includes(savedLocale)) {
    $i18n.setLocale(savedLocale as 'et' | 'en' | 'uk')
  }
  
  // Watch for locale changes and save to localStorage
  watch(() => $i18n.locale.value, (newLocale) => {
    localStorage.setItem('app_locale', newLocale)
  }, { immediate: true })
})
