const CACHE_VERSION = 'v7';
const CACHE_NAME = 'pvz-cache-' + CACHE_VERSION;
const ICON_CACHE = 'pvz-icons-' + CACHE_VERSION;
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];
const ICON_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(ICON_CACHE).then((cache) => {
        return Promise.all(
          ICON_ASSETS.map((url) =>
            fetch(url, { cache: 'no-store' })
              .then((resp) => { if (resp.ok) cache.put(url, resp); })
              .catch(() => {})
          )
        );
      }),
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== ICON_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const isCall = data.type === 'call';
    const title = data.title || (isCall ? 'Входящий звонок' : 'Новое сообщение');
    const options = {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || (isCall ? 'incoming-call' : 'chat-message'),
      data: { url: data.url || '/chat', type: data.type || 'message' },
      vibrate: isCall ? [300, 200, 300, 200, 300] : [200, 100, 200],
      renotify: true,
      requireInteraction: isCall,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('Push event error:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/chat';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    });
  }
  if (event.data === 'REFRESH_ICONS') {
    caches.open(ICON_CACHE).then((cache) => {
      ICON_ASSETS.forEach((url) => {
        fetch(url, { cache: 'no-store' })
          .then((resp) => { if (resp.ok) cache.put(url, resp); })
          .catch(() => {});
      });
    });
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/debug') ||
      url.pathname.startsWith('/api/debug')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/objects/')) {
    return;
  }

  if (event.request.method !== 'GET') return;

  if (url.pathname === '/manifest.json') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })))
    );
    return;
  }

  if (url.pathname.match(/^\/icon-\d+\.png$/) || url.pathname === '/apple-touch-icon.png' || url.pathname === '/favicon.png') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(ICON_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || new Response('', { status: 404 })))
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
          return response;
        })
        .catch(() => caches.match('/').then((r) => r || createOfflinePage()))
    );
    return;
  }

  if (url.pathname.match(/\.[a-f0-9]{8,}\.(js|css)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || new Response('', { status: 404 })))
    );
    return;
  }

  if (url.pathname.match(/\.(woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request).then((cached) => cached || new Response('Offline', { status: 503 })))
  );
});

function createOfflinePage() {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отметки — Офлайн</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; color: #1e293b; padding: 24px; }
    .container { text-align: center; max-width: 400px; }
    .icon { margin-bottom: 16px; }
    .icon svg { width: 64px; height: 64px; color: #94a3b8; }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
    p { color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    button { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; }
    button:active { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" /></svg></div>
    <h1>Нет подключения</h1>
    <p>Проверьте интернет-соединение и попробуйте снова</p>
    <button onclick="location.reload()">Обновить</button>
  </div>
</body>
</html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    status: 503,
  });
}
