// Versión del caché - se actualiza automáticamente en cada build
const CACHE_VERSION = '%%CACHE_VERSION%%';
const CACHE_NAME = `dsy-catalogo-${CACHE_VERSION}`;

// Cachés separados por tipo de recurso
const CACHE_STATIC = `static-${CACHE_VERSION}`;
const CACHE_IMAGES = `images-${CACHE_VERSION}`;
const CACHE_FONTS = `fonts-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `dynamic-${CACHE_VERSION}`;

// Recursos críticos para pre-cachear (offline-first)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  // Fonts
  './fonts/poppins-300.woff2',
  './fonts/poppins-400.woff2',
  './fonts/poppins-500.woff2',
  './fonts/poppins-600.woff2',
  './fonts/poppins-700.woff2',
  // Icons
  './icons/icon-72x72.svg',
  './icons/icon-96x96.svg',
  './icons/icon-128x128.svg',
  './icons/icon-144x144.svg',
  './icons/icon-152x152.svg',
  './icons/icon-192x192.svg',
  './icons/icon-512x512.svg',
  // External libraries (CDN)
  'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  'https://unpkg.com/mithril/mithril.js'
];

// ========== INSTALACIÓN ==========
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Instalando versión ${CACHE_VERSION}...`);

  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[Service Worker] Pre-cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Instalado correctamente');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear archivos:', error);
      })
  );
});

// ========== ACTIVACIÓN ==========
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activando versión ${CACHE_VERSION}...`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar cachés de versiones anteriores
            if (cacheName.includes('dsy-catalogo') &&
                !cacheName.includes(CACHE_VERSION)) {
              console.log('[Service Worker] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activado correctamente');
        return self.clients.claim(); // Tomar control inmediatamente
      })
  );
});

// ========== ESTRATEGIAS DE CACHÉ ==========

// Estrategia 1: Cache First (para recursos estáticos)
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Error en cache-first:', error);
    throw error;
  }
}

// Estrategia 2: Stale While Revalidate (para imágenes)
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      caches.open(cacheName).then((cache) => {
        cache.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  }).catch(() => {
    // Si falla la red, no hacer nada (ya tenemos caché)
  });

  // Retornar caché inmediatamente si existe, sino esperar red
  return cachedResponse || fetchPromise;
}

// Estrategia 3: Network First (para contenido dinámico)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Sirviendo desde caché (offline):', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// ========== FETCH - ENRUTAMIENTO POR TIPO ==========
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no HTTP(S)
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ignorar peticiones POST, PUT, DELETE (solo cache GET)
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 1. FUENTES - Cache First (nunca cambian)
        if (request.url.includes('/fonts/') || request.url.includes('.woff2')) {
          return await cacheFirst(request, CACHE_FONTS);
        }

        // 2. IMÁGENES - Stale While Revalidate (actualización en background)
        if (request.destination === 'image' ||
            request.url.includes('/assets/') ||
            request.url.includes('/icons/')) {
          return await staleWhileRevalidate(request, CACHE_IMAGES);
        }

        // 3. CSS/JS - Cache First (versionados)
        if (request.url.endsWith('.css') ||
            request.url.endsWith('.js') ||
            request.url.includes('lodash') ||
            request.url.includes('mithril')) {
          return await cacheFirst(request, CACHE_STATIC);
        }

        // 4. HTML - Cache First (sitio estático)
        if (request.destination === 'document' ||
            request.url.endsWith('.html') ||
            url.pathname === '/' ||
            url.pathname === '/index.html') {
          return await cacheFirst(request, CACHE_STATIC);
        }

        // 5. MANIFEST y otros - Cache First
        if (request.url.includes('manifest.json')) {
          return await cacheFirst(request, CACHE_STATIC);
        }

        // 6. CUALQUIER OTRO - Network First con fallback a caché
        return await networkFirst(request, CACHE_DYNAMIC);

      } catch (error) {
        console.error('[Service Worker] Error en fetch:', error);

        // Fallback para navegación: mostrar index.html en caché
        if (request.destination === 'document') {
          const cachedIndex = await caches.match('./index.html');
          if (cachedIndex) {
            return cachedIndex;
          }
        }

        // Respuesta de error genérica
        return new Response('Contenido no disponible offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain; charset=utf-8'
          })
        });
      }
    })()
  );
});

// ========== SINCRONIZACIÓN EN SEGUNDO PLANO ==========
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización en segundo plano');

  if (event.tag === 'sync-cache') {
    event.waitUntil(
      // Actualizar imágenes en background
      caches.open(CACHE_IMAGES).then((cache) => {
        return cache.keys().then((requests) => {
          return Promise.all(
            requests.map((request) => {
              return fetch(request).then((response) => {
                if (response && response.status === 200) {
                  return cache.put(request, response);
                }
              }).catch(() => {
                // Ignorar errores en sync
              });
            })
          );
        });
      })
    );
  }
});

// ========== NOTIFICACIONES PUSH ==========
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido');

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nuevo contenido disponible en el catálogo',
    icon: './icons/icon-192x192.svg',
    badge: './icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    tag: 'catalogo-update',
    data: {
      url: data.url || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'DSY Catálogo',
      options
    )
  );
});

// Manejar click en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || './')
  );
});

// ========== MENSAJES DESDE LA APP ==========
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensaje recibido:', event.data);

  // Comando para limpiar caché manualmente
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  // Comando para obtener versión
  if (event.data && event.data.action === 'getVersion') {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
      caches: [CACHE_STATIC, CACHE_IMAGES, CACHE_FONTS, CACHE_DYNAMIC]
    });
  }

  // Comando para limpiar todas las cachés
  if (event.data && event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ cleared: true });
      })
    );
  }
});

console.log(`[Service Worker] Cargado - Versión ${CACHE_VERSION}`);
