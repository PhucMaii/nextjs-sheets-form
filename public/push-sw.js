importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js');
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', (event) => {
    const data = event.data?.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
    });
  });
  