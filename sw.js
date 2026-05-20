// Versão do cache — mude este valor para forçar atualização em todos os browsers
const CACHE_NAME = 'prazos-tjpr-v17';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './supabase-init.js',
  './contexts.js',
  './utils.js',
  './regrasCNJ.js',
  './regrasCrime.js',
  './regrasCivel.js',
  './minutas-default.js',
  './login.js',
  './components.js',
  './app.js',
  './BugReportsPage.js',
  './CalendarAdminPage.js',
  './MinutasAdminPage.js',
  './MinutaPreparoAdminPage.js',
  './MinutaPreparoFlow.js',
  './MinutaPreparoPage.js',
  './MinutarioPage.js',
  './AgentStudioAdminPage.js',
  './TriagemIAPage.js',
  './Logo.png',
  './manifest.json'
];

// Instalação — cache com tolerância a falhas individuais
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Não foi possível cachear:', url, err);
          })
        )
      );
    })
  );
});

// Ativação — limpa caches antigos automaticamente
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — Network First para arquivos locais, Cache First para CDNs externos
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCdn = url.hostname.includes('cdnjs') || url.hostname.includes('unpkg') ||
                url.hostname.includes('cdn.jsdelivr') || url.hostname.includes('fonts.googleapis');

  if (isCdn) {
    // CDNs: Cache First (raramente mudam)
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    // Arquivos locais: Network First (sempre pega a versão mais recente)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200 && isLocal) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});