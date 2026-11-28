import {version} from '$app/env';
import {assets, immutable} from '$app/manifest';
import {self} from '$app/service-worker';

const CACHE_PREFIX = 'pixplaze-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}${version}`;

const OFFLINE_URL = new URL('/offline', self.registration.scope).toString();
const ENV_URL = new URL('_app/env.js', self.registration.scope).toString();

const PRECACHE_URLS = [
  ...immutable.map(({ path }) => new URL(path, self.registration.scope).toString()),
  ...assets.map(({ path }) => new URL(path, self.registration.scope).toString()),
  OFFLINE_URL,
  ENV_URL
].filter((url, index, all) => all.indexOf(url) === index);

const PRECACHED_PATHS = new Set(PRECACHE_URLS.map((url) => new URL(url).pathname));

const CACHE_MATCH_OPTIONS = {
  ignoreSearch: true,
  ignoreVary: true
};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
  })());
});

// Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();

    await Promise.all(
        cacheNames.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  // Navigation requests
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(CACHE_NAME);

        // The offline page itself: serve its cached HTML.
        if (requestUrl.pathname === new URL(OFFLINE_URL).pathname) {
          const offlinePage = await cache.match(
              OFFLINE_URL,
              CACHE_MATCH_OPTIONS
          );

          return offlinePage ?? new Response(
            'Offline page unavailable', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        }

        // Any other navigation: redirect to the offline page.
        const offlineUrl = new URL(OFFLINE_URL);
        offlineUrl.searchParams.set('returnTo', request.url);

        return Response.redirect(offlineUrl.toString(), 302);
      }
    })());
    return;
  }

  // Cache-first only for files explicitly included in the deployment precache.
  // API calls and all other requests retain the browser's normal behavior.
  if (PRECACHED_PATHS.has(requestUrl.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);

      const cached = await cache.match(request, CACHE_MATCH_OPTIONS);

      if (cached) {
        return cached;
      }

      // Cache miss: try the network.
      const response = await fetch(request);

      if (response.ok) {
        try {
          await cache.put(request, response.clone());
        } catch (error) {
          console.warn('[SW] Could not cache:', requestUrl.pathname, error);
        }
      }

      return response;
    })());
  }
});

function sameOriginUrl(candidate, fallback) {
  if (!candidate)
    return fallback;
  try {
    const parsed = new URL(candidate, self.registration.scope);
    return parsed.origin === self.location.origin ? parsed.toString() : fallback;
  }
  catch {
    return fallback;
  }
}

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let payload = {};
    const rawData = event.data?.text();

    if (rawData) {
      try {
        payload = JSON.parse(rawData);
      }
      catch {
        payload = { body: rawData };
      }
    }
    const fallbackIcon = new URL('icons/icon-192.png', self.registration.scope).toString();
    const fallbackBadge = new URL('icons/badge-96.png', self.registration.scope).toString();
    const targetUrl = sameOriginUrl(payload.url, self.registration.scope);

    await self.registration.showNotification(payload.title || 'Pixplaze', {
      body: payload.body || 'У вас новое уведомление.',
      icon: sameOriginUrl(payload.icon, fallbackIcon),
      badge: sameOriginUrl(payload.badge, fallbackBadge),
      tag: payload.tag,
      data: { url: targetUrl }
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Получаем целевой URL (если его нет, открываем корень сайта)
  const targetUrl = event.notification.data?.url
      ? sameOriginUrl(event.notification.data.url, self.registration.scope)
      : self.registration.scope;

  event.waitUntil((async () => {
    // Ищем все открытые вкладки нашего сайта
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });


    const existingClient = windowClients[0];

    if (existingClient) {
      try {
        // Пытаемся плавно перенаправить существующую вкладку
        await existingClient.navigate(targetUrl);
        await existingClient.focus();
        return;
      } catch (error) {
        console.warn('Не удалось перенаправить существующую вкладку (SW не активен для нее). Открываем новую.', error);
        // Если navigate() упал из-за несовпадения версий SW — просто открываем новое окно
        await self.clients.openWindow(targetUrl);
        return;
      }
    }

    // Если открытых вкладок не было — просто открываем новую
    await self.clients.openWindow(targetUrl);
  })());
});

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    await self.skipWaiting();
  }
});
