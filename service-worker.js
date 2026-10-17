const CACHE_NAME = 'adidas-store-shell-v7';
const APP_SHELL = [
  './',
  './index.html',
  './shop.html',
  './product.html',
  './account.html',
  './superstar-jordan.html',
  './store.css',
  './account.css',
  './catalog.js',
  './catalog-extra.js',
  './store.js',
  './account.js',
  './pwa.js',
  './manifest.webmanifest',
  './adidas_logo.png',
  './사진1_왼쪽측면.png',
  './사진2_두켤레.png',
  './사진3_위에서본모습.png',
  './사진4_밑창.png',
  './컬러옵션1.png',
  './superstar-jordan-banner.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) await (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    }
  })());
});
