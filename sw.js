/* Dr Sam's Academy service worker. Cache-first shell; bump CACHE_V per release. */
const CACHE_V = 'drsam-k5-v4';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }).then(hit => {
      if (hit) {
        fetch(e.request).then(fresh => { if (fresh && fresh.ok) caches.open(CACHE_V).then(c => c.put(e.request, fresh)); }).catch(() => {});
        return hit;
      }
      return fetch(e.request).then(fresh => {
        if (fresh && fresh.ok) { const copy = fresh.clone(); caches.open(CACHE_V).then(c => c.put(e.request, copy)); }
        return fresh;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
