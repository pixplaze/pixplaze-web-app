import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';
import { self } from '$app/service-worker';

const CACHE_PREFIX = 'pixplaze-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}${version}`;
const OFFLINE_URL = new URL('offline.html', self.registration.scope).toString();
/**
 * Cache only files produced by the build and files from static/.
 * Do not add API responses or authenticated HTML pages to this cache.
 */
const PRECACHE_URLS = [
  ...immutable.map(({ path }) => new URL(path, self.registration.scope).toString()),
  ...assets.map(({ path }) => new URL(path, self.registration.scope).toString()),
  OFFLINE_URL
].filter((url, index, all) => all.indexOf(url) === index);

const PRECACHED_PATHS = new Set(PRECACHE_URLS.map((url) => new URL(url).pathname));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    // Deliberately do not call skipWaiting(): allow the current app session
    // to finish before the newly installed worker takes control.
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET')
    return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin)
    return;
  // Do not cache SSR navigations: they may contain account-specific data.
  // Network first, with a static non-personal offline page as a fallback.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      }
      catch {
        const cache = await caches.open(CACHE_NAME);
        return ((await cache.match(OFFLINE_URL)) ??
          new Response('Офлайн. Проверьте подключение к интернету.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          }));
      }
    })());
    return;
  }
  // Cache-first only for files explicitly included in the deployment precache.
  // API calls and all other requests retain the browser's normal behavior.
  if (!PRECACHED_PATHS.has(requestUrl.pathname))
    return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached)
      return cached;
    const response = await fetch(request);
    if (response.ok)
      await cache.put(request, response.clone());
    return response;
  })());
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
  const targetUrl = sameOriginUrl(event.notification.data?.url, self.registration.scope);
  event.waitUntil((async () => {
    const windowClients = (await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }));
    const existingClient = windowClients[0];
    if (existingClient) {
      await existingClient.navigate(targetUrl);
      await existingClient.focus();
      return;
    }
    await self.clients.openWindow(targetUrl);
  })());
});

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    await self.skipWaiting();
  }
});
//
// self.addEventListener('activate', (event) => {
//   event.waitUntil((async () => {
//     const cacheNames = await caches.keys();
//     await Promise.all(
//       cacheNames.filter((name) => name.startsWith(CACHE_PREFIX))
//         .map((name) => caches.delete(name))
//     );
//
//     await self.clients.claim();
//   })());
// });
