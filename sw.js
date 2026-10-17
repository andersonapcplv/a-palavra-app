const CACHE = 'a-palavra-v0.9.5';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './assets/hero-paz-piloto.webp',
  './assets/reflexao-paz-piloto.webp',
  './assets/quadro-institucional-piloto.webp',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/audio/uniq-art-of-silence-v2.ogg',
  './data/marcos-n4.json',
  './data/biblia-livre-n4.json',
  './data/biblia-livre-n4-origem.json',
  './content/studies-approved.json'
];

const sameOrigin = (request) => new URL(request.url).origin === self.location.origin;

function cacheKey(request) {
  const url = new URL(request.url);
  url.search = '';
  return new Request(url.href, { method: 'GET' });
}

async function cacheResponse(request, response) {
  if (response && response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(cacheKey(request), response.clone());
  }
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('a-palavra-') && key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !sameOrigin(request)) return;

  const key = cacheKey(request);
  if (new URL(request.url).pathname.endsWith('/content/studies-approved.json')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => cacheResponse(request, response))
        .catch(() => caches.match(key))
    );
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(key)
      .then((hit) => hit || fetch(request).then((response) => cacheResponse(request, response)))
  );
});
