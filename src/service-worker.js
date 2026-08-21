/**
 * Service Worker pour DkrOnlineStore
 * Cache assets statiques et images produits pour performance optimale
 */

const CACHE_NAME = 'dkronlinestore-v1';
const RUNTIME_CACHE = 'dkronlinestore-runtime';

// Assets à mettre en cache lors de l'installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/polyfills.js',
  '/assets/images/logo.jpeg',
  '/assets/images/placeholder.svg',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Précache assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );

  // Activer immédiatement
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Prendre le contrôle immédiatement
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas cacher les requêtes API
  if (url.origin !== self.location.origin) {
    return;
  }

  // Stratégie: Cache First pour assets statiques
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Stratégie: Network First pour HTML
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Stratégie: Stale While Revalidate pour images
  if (isImage(request)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }
});

/**
 * Cache First: Retourne du cache si disponible, sinon fetch
 */
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

/**
 * Network First: Fetch d'abord, fallback sur cache
 */
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, fallback cache:', request.url);
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Retourner page offline si disponible
    return caches.match('/index.html');
  }
}

/**
 * Stale While Revalidate: Retourne cache puis update en background
 */
async function staleWhileRevalidateStrategy(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(RUNTIME_CACHE);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });

  return cached || fetchPromise;
}

/**
 * Vérifie si la requête est un asset statique
 */
function isStaticAsset(request) {
  return (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.url.includes('/assets/')
  );
}

/**
 * Vérifie si la requête est une image
 */
function isImage(request) {
  return request.destination === 'image';
}
