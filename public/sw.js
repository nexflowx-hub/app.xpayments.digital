// ── XPayments Service Worker v3 ──
// Cache versioning with build timestamp for reliable cache busting

const CACHE_VERSION = 'xp-v3';
const BUILD_TIMESTAMP = '20250620000000'; // Updated per deployment
const CACHE_NAME = `${CACHE_VERSION}-${BUILD_TIMESTAMP}`;

const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;
const FONTS_CACHE = `${CACHE_VERSION}-fonts`;

// ── Static assets to precache on install ──
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/logo.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html',
];

// ── Google Fonts domains to cache ──
const FONT_URL_PATTERN = /^https:\/\/fonts\.googleapis\.com\/css2\?/;
const FONT_FILE_PATTERN = /^https:\/\/fonts\.gstatic\.com\//;

// ── Install: pre-cache critical assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Warm the cache with critical assets — don't fail the install if one is missing
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache
            .add(url)
            .catch((err) => console.warn(`[SW] Failed to precache: ${url}`, err))
        )
      );
    })
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ── Activate: clean old caches, claim clients ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== OFFLINE_CACHE && k !== FONTS_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy per resource type ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin non-fonts
  if (request.method !== 'GET') return;

  // ─── Google Fonts CSS: stale-while-revalidate ───
  if (FONT_URL_PATTERN.test(url.href)) {
    event.respondWith(staleWhileRevalidate(request, FONTS_CACHE));
    return;
  }

  // ─── Google Fonts static files (woff2, etc): cache-first with font cache ───
  if (FONT_FILE_PATTERN.test(url.href)) {
    event.respondWith(cacheFirst(request, FONTS_CACHE, 30 * 24 * 60 * 60)); // 30 days
    return;
  }

  // ─── API calls: network-first, fall back to cache ───
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // ─── Same-origin HTML pages: stale-while-revalidate for instant load ───
  if (
    url.origin === self.location.origin &&
    (request.headers.get('accept') || '').includes('text/html')
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // ─── Same-origin static assets: stale-while-revalidate ───
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }
});

// ─────────────────────────────────────────────
// Caching strategies
// ─────────────────────────────────────────────

/**
 * Network-first: try the network, fall back to cache.
 * Used for API calls to ensure fresh data.
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return a minimal offline response for failed API calls
    return new Response(
      JSON.stringify({ error: 'Sem conexão à internet', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Cache-first: try cache, fall back to network then update cache.
 * Used for fonts and immutable assets.
 */
async function cacheFirst(request, cacheName, maxAgeSeconds) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Stale-while-revalidate: serve from cache immediately,
 * then fetch in background and update cache for next time.
 * Provides instant loads while staying up-to-date.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fire-and-forget background update
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((err) => {
      console.warn(`[SW] Background revalidate failed for ${request.url}`, err);
    });

  // Return cached version immediately, or wait for network if no cache
  if (cached) return cached;

  try {
    return await fetchPromise;
  } catch {
    // For navigation requests, try offline fallback
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}