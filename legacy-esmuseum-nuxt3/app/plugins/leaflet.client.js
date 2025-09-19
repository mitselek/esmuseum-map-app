// Leaflet Vue plugin for client-side only

export default defineNuxtPlugin(() => {
  // Leaflet is client-side only, so we don't need to do anything here
  // The components will handle the imports when they mount
  if (import.meta.client) {
    // Fix Leaflet's default icon path issues in bundled environments
    if (typeof window !== 'undefined') {
      // Import Leaflet globally on client
      import('leaflet').then((L) => {
        // Fix default marker icons in production
        delete L.default.Icon.Default.prototype._getIconUrl
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
        })
      })
    }
  }
})
