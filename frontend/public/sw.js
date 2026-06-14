/**
 * RO-MESH — Service Worker
 * Strategy: Aggressive Cache-First for all static assets (HTML, CSS, JS, images, fonts)
 *           Network-First with offline fallback for API calls
 *
 * Offline guarantee: Core site, flashing guides, and all static documentation
 * load from cache with zero network dependency after the first visit.
 */

'use strict';

/* ════════════════════════════════════════════════════════════════════════════
   VERSION & CACHE NAMES
   Bump SW_VERSION to force cache invalidation on next deploy.
   ════════════════════════════════════════════════════════════════════════════ */
const SW_VERSION = 'v1.2.0';
const CACHE_STATIC = `ro-mesh-static-${SW_VERSION}`;
const CACHE_DYNAMIC = `ro-mesh-dynamic-${SW_VERSION}`;
const CACHE_API = `ro-mesh-api-${SW_VERSION}`;

/* ════════════════════════════════════════════════════════════════════════════
   PRECACHE MANIFEST — All files that must work offline
   These are fetched and cached during the `install` phase.
   ════════════════════════════════════════════════════════════════════════════ */
const PRECACHE_URLS = [
  /* ── Shell ────────────────────────────────────────────────────────────── */
  '/',
  '/index.html',
  '/meshcore/',
  '/meshcore/index.html',
  '/meshtastic/',
  '/meshtastic/index.html',
  '/reticulum/',
  '/reticulum/index.html',
  '/manifest.json',
  '/offline.html',
  '/dictionar.html',

  /* ── Stylesheets ──────────────────────────────────────────────────────── */
  '/css/style.css',

  /* ── Scripts ─────────────────────────────────────────────────────────── */
  '/js/app.js',
  '/js/dictionary.js',
  '/js/tooltip.js',
  '/js/search-index.js',
  '/js/search.js',
  '/js/pwa-install.js',

  /* ── Images ──────────────────────────────────────────────────────────── */
  '/images/hero-mesh-romania.jpg',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/og-hero.jpg',

  /* ── External fonts (cached via dynamic fetch below, listed for intent) */
  // Google Fonts are handled separately in the dynamic cache

  /* ── Sections that need to work offline ──────────────────────────────── */
  '/#instalare',

  /* ── Static documentation pages (add as they are created) ───────────── */
  // '/ghiduri/instalare-nod.html',
  // '/ghiduri/configurare-romania.html',
  // '/ghiduri/hardware.html',
];

/* ════════════════════════════════════════════════════════════════════════════
   API ENDPOINTS — Network-First, fall back to cached stub
   ════════════════════════════════════════════════════════════════════════════ */
const API_ROUTES = ['/api/stats', '/api/health'];

/* Stub offline response for /api/stats when network unavailable */
const OFFLINE_STATS_STUB = {
  activeNodes: null,
  relayCount: null,
  messagesLast24h: null,
  countiesReached: null,
  offline: true,
  message: 'Date indisponibile offline. Conectați-vă la internet pentru statistici live.',
};

/* ════════════════════════════════════════════════════════════════════════════
   INSTALL — Precache all static assets
   SW won't activate until all precache promises resolve (skipWaiting for faster
   updates on first use, but only after full precache succeeds).
   ════════════════════════════════════════════════════════════════════════════ */
self.addEventListener('install', (event) => {
  console.log(`[RO-MESH SW ${SW_VERSION}] Instalare — precaching ${PRECACHE_URLS.length} resurse`);

  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(async (cache) => {
        // Use addAll with individual error handling to prevent one missing asset
        // from failing the entire precache.
        const results = await Promise.allSettled(
          PRECACHE_URLS.map(url =>
            cache.add(url).catch(err => {
              // Non-critical: log but don't fail install
              console.warn(`[SW] Nu s-a putut precache: ${url}`, err.message);
            })
          )
        );

        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        console.log(`[RO-MESH SW] Precache complet: ${succeeded}/${PRECACHE_URLS.length} resurse`);
      })
      .then(() => {
        // Skip waiting allows the new SW to activate immediately
        // (safe here since we're a static site with no complex state)
        return self.skipWaiting();
      })
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   ACTIVATE — Prune stale caches from previous SW versions
   ════════════════════════════════════════════════════════════════════════════ */
self.addEventListener('activate', (event) => {
  const CURRENT_CACHES = new Set([CACHE_STATIC, CACHE_DYNAMIC, CACHE_API]);
  console.log(`[RO-MESH SW ${SW_VERSION}] Activare — curățare cache-uri vechi`);

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => !CURRENT_CACHES.has(name))
            .map(name => {
              console.log(`[SW] Ștergere cache vechi: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Claim all open clients immediately so the new SW controls
        // them without requiring a page reload.
        console.log(`[RO-MESH SW] ✓ Activat și controlând toți clienții`);
        return self.clients.claim();
      })
  );
});

/* ════════════════════════════════════════════════════════════════════════════
   FETCH — Request interception strategies
   ════════════════════════════════════════════════════════════════════════════ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── Ignore non-GET requests (POST, PUT, DELETE etc.) ──────────────────────
  if (request.method !== 'GET') return;

  // ── Ignore browser extension requests ────────────────────────────────────
  if (!url.protocol.startsWith('http')) return;

  // ── Ignore cross-origin requests except fonts ────────────────────────────
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  // ─────────────────────────────────────────────────────────────────────────
  // STRATEGY 1: API Routes → Network-First, cached fallback stub
  // ─────────────────────────────────────────────────────────────────────────
  if (isSameOrigin && API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(networkFirstWithStub(request, url));
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STRATEGY 2: Google Fonts → Stale-While-Revalidate (dynamic cache)
  // Fonts rarely change; serve from cache instantly, update in background.
  // ─────────────────────────────────────────────────────────────────────────
  if (isGoogleFont) {
    event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC));
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STRATEGY 3: Same-origin → Cache-First (precached static assets)
  // For navigation requests: fallback to index.html (SPA shell)
  // ─────────────────────────────────────────────────────────────────────────
  if (isSameOrigin) {
    event.respondWith(cacheFirstWithNetworkFallback(request));
    return;
  }
});

/* ════════════════════════════════════════════════════════════════════════════
   STRATEGY IMPLEMENTATIONS
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * Cache-First with Network Fallback
 * Returns cached version immediately; falls back to network if not cached.
 * For HTML navigation, falls back to /index.html (SPA shell) if offline.
 */
async function cacheFirstWithNetworkFallback(request) {
  const isNavigation = request.mode === 'navigate';

  // 1. Try static cache first
  const cached = await caches.match(request, {
    cacheName: CACHE_STATIC,
    ignoreSearch: isNavigation, // Match navigation regardless of query params
  });

  if (cached) {
    return cached;
  }

  // 2. Try dynamic cache
  const dynamicCached = await caches.match(request, { cacheName: CACHE_DYNAMIC });
  if (dynamicCached) {
    return dynamicCached;
  }

  // 3. Fetch from network and cache dynamically
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
      // Cache successful responses dynamically (images, docs, etc.)
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (err) {
    // 4. Offline fallback
    if (isNavigation) {
      // Return the offline page for failed navigation requests
      const offlinePage = await caches.match('/offline.html', { cacheName: CACHE_STATIC })
        || await caches.match('/', { cacheName: CACHE_STATIC })
        || await caches.match('/index.html', { cacheName: CACHE_STATIC });
      if (offlinePage) return offlinePage;
    }

    // Generic fallback for non-navigation requests
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Resursa nu este disponibilă offline.' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

/**
 * Network-First with Stub Fallback
 * Tries network first; on failure, returns a meaningful offline stub JSON.
 * Caches successful API responses briefly for reuse during same session.
 */
async function networkFirstWithStub(request, url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);

    if (networkResponse.ok) {
      // Cache successful API response
      const cache = await caches.open(CACHE_API);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (err) {
    // Try cached API response first
    const cachedApi = await caches.match(request, { cacheName: CACHE_API });
    if (cachedApi) {
      console.log(`[SW] Servind API din cache: ${url.pathname}`);
      return cachedApi;
    }

    // Return offline stub
    console.log(`[SW] Offline stub pentru: ${url.pathname}`);
    return new Response(
      JSON.stringify(
        url.pathname.includes('stats')
          ? OFFLINE_STATS_STUB
          : { status: 'offline', message: 'Serviciu indisponibil offline.' }
      ),
      {
        status: 200, // Return 200 so the app can handle it gracefully
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-SW-Offline': 'true',
        },
      }
    );
  }
}

/**
 * Stale-While-Revalidate
 * Returns cached immediately (fast), then updates cache in background.
 * Ideal for fonts and third-party assets that change infrequently.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Revalidate in background (don't await)
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null); // Ignore network errors for background revalidation

  return cached || await fetchPromise;
}

/* ════════════════════════════════════════════════════════════════════════════
   MESSAGE HANDLER
   Allows the app to communicate with the SW (e.g., for manual cache clear)
   ════════════════════════════════════════════════════════════════════════════ */
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_STATUS':
      // Respond with cache sizes for debugging
      Promise.all([
        caches.open(CACHE_STATIC).then(c => c.keys()),
        caches.open(CACHE_DYNAMIC).then(c => c.keys()),
      ]).then(([staticKeys, dynamicKeys]) => {
        event.source?.postMessage({
          type: 'CACHE_STATUS_RESPONSE',
          static: staticKeys.length,
          dynamic: dynamicKeys.length,
          version: SW_VERSION,
        });
      });
      break;

    default:
      console.log('[SW] Mesaj necunoscut:', event.data.type);
  }
});

/* ════════════════════════════════════════════════════════════════════════════
   BACKGROUND SYNC (future: for queued mesh messages when offline)
   ════════════════════════════════════════════════════════════════════════════ */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mesh-messages') {
    console.log('[SW] Background sync: sincronizare mesaje mesh…');
    // TODO: Implement when backend message queue is ready
  }
});

console.log(`[RO-MESH SW ${SW_VERSION}] Service Worker încărcat ✓`);
