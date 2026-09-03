const CACHE_NAME = 'dabsy-v2';
const ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './vision.js',
  './ai.js',
  './voice.js',
  './memory.js',
  './personality.js',
  './behavior.js',
  './manifest.json',
  './assets/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)).catch(() => {})
  );
});
