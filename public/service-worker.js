importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js',
);

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

// Injected by next-pwa / workbox at build time
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

const CDN_HOST = 'db3uf8fcaqsi.cloudfront.net';

// 1) CloudFront media: long-lived, immutable
registerRoute(
  ({ url }) => url.hostname === CDN_HOST,
  new CacheFirst({
    cacheName: 'cdn-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 2000,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// 2) Next.js image optimizer responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/image'),
  new StaleWhileRevalidate({
    cacheName: 'next-image',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// 3) Next static build files (hashed)
registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/static'),
  new CacheFirst({
    cacheName: 'next-static',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

self.addEventListener('push', async (e) => {
  const data = JSON.parse(e.data.text());

  const title = data?.message || 'Notification';
  const body = data?.body || '';

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logo-144.png',
    }),
  );
  // console.log('Access to push event')
  // self.registration.showNotification('Wohooo!!!', {body: 'Hello world!'})
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // This looks to see if the current window is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/driver/overview' && 'focus' in client)
            return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('/driver/overview');
      }),
  );
});
