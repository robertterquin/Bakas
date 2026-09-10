const CACHE_SHELL_NAME = 'bakas-shell-v4';
const CACHE_TILES_NAME = 'bakas-tiles-v4';
const MAX_TILES = 1000;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/bakas-logo.svg',
];

// 1. Install: Cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Purge ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_SHELL_NAME && name !== CACHE_TILES_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Non-blocking throttled tile cache cleanup
let isTrimming = false;
async function trimTileCache(cacheName, maxItems) {
  if (isTrimming) return;
  isTrimming = true;
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const itemsToDelete = keys.slice(0, keys.length - maxItems);
      for (const item of itemsToDelete) {
        await cache.delete(item);
      }
    }
  } catch {
    // Ignore cache cleanup errors
  } finally {
    isTrimming = false;
  }
}

// 3. Fetch: Cache-first for Clean Map Tiles & Network-First for Navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Bypass Service Worker completely in local development to protect Vite HMR
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // B. Map Tiles (Esri CDN, CARTO, or OSM)
  if (
    url.hostname.includes('arcgisonline.com') ||
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('openstreetmap.org')
  ) {
    event.respondWith(
      caches.open(CACHE_TILES_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            trimTileCache(CACHE_TILES_NAME, MAX_TILES);
          }
          return networkResponse;
        } catch {
          return cachedResponse || new Response('', { status: 408, statusText: 'Tile Offline' });
        }
      })
    );
    return;
  }

  // C. Bypass caching for Supabase REST / RPC API endpoints
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // D. App Navigation (Network-First: ensures users always receive latest app version online)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_SHELL_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_SHELL_NAME);
          return (await cache.match(request)) || (await cache.match('/index.html'));
        })
    );
    return;
  }

  // E. Hashed Static Assets (Stale-While-Revalidate)
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_SHELL_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default network fetch
  event.respondWith(fetch(request));
});
