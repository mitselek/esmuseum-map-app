/**
 * Minimal service worker (#58).
 *
 * Exists only because Chrome requires a service worker with a fetch handler
 * before it offers "install as app". It caches nothing: page loads go to the
 * network, everything else is left to the browser, so a deploy is never
 * served stale.
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
  }
})
