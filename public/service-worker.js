const CACHE_NAME = 'dsy-catalogo-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  'https://unpkg.com/mithril/mithril.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Instalado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear archivos:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activado correctamente');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones (estrategia: Network First, luego Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la petición es exitosa, actualizar caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usar caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Sirviendo desde caché:', event.request.url);
            return cachedResponse;
          }

          // Si no está en caché y es una navegación, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }

          return new Response('Contenido no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización en segundo plano');
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí podrías sincronizar datos cuando haya conexión
      Promise.resolve()
    );
  }
});

// Notificaciones push (opcional para futuras mejoras)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido');
  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización disponible',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'catalogo-update'
  };

  event.waitUntil(
    self.registration.showNotification('DSY Catálogo', options)
  );
});
