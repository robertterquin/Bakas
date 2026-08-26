const CACHE_SHELL_NAME = 'bakas-shell-v1';
const CACHE_TILES_NAME = 'bakas-tiles-v1';
const MAX_TILES = 600;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
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

// 2. Activate: Cleanup outdated caches
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

// Helper: Trim tile cache to prevent excessive storage
async function trimTileCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimTileCache(cacheName, maxItems);
  }
}

// 3. Fetch: Cache-first for CartoDB Map Tiles & Stale-while-revalidate for Shell
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. CartoDB Dark Matter Tiles (Cache-First strategy)
  if (url.hostname.includes('cartocdn.com') || url.pathname.includes('/dark_all/')) {
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
          // If completely offline and tile is not in cache, return fallback or cached response
          return cachedResponse || new Response('', { status: 408, statusText: 'Tile Offline' });
        }
      })
    );
    return;
  }

  // B. Bypass caching for Supabase REST / RPC API endpoints
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // C. App Shell Assets (Stale-While-Revalidate)
  if (request.mode === 'navigate' || request.destination === 'script' || request.destination === 'style') {
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
