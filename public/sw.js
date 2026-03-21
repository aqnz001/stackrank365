// StackRank365 Service Worker
// Clean passthrough — no caching, fixes the Response clone error
const CACHE_NAME = 'sr365-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Pure passthrough — no caching, no clone
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
