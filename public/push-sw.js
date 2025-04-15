importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js',
);
import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
precacheAndRoute(self.__WB_MANIFEST);
self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
  self.skipWaiting(); // Force it to activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(self.clients.claim()); // Take control of all tabs
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  const data = event.data?.json() || {};
  console.log('[Service Worker] Push data:', data);

  const title = data.title || 'New Notification';
  const options = {
    body: data.body || '',
    icon: 'images/logo-72.png', // optional
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
