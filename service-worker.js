/* Service Worker for SP-2025-transport */
const CACHE_NAME = 'sp-2025-transport-v1';
const URLS_TO_CACHE = [
  '/SP-2025-transport/',
  '/SP-2025-transport/index.html',
  '/SP-2025-transport/assets/manifest.json',
  '/SP-2025-transport/assets/icons/icon-192x192.png',
  '/SP-2025-transport/assets/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;

  // Cache-first for same-origin requests
  if (new URL(req.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        }).catch(() => caches.match('/SP-2025-transport/index.html'));
      })
    );
  }
});
