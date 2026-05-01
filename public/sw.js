// Self-unregistering kill-switch — clears all caches and unregisters.
// The browser auto-fetches sw.js periodically; when it sees this version,
// the old SW is replaced and immediately removed.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.navigate(c.url));
  })());
});
