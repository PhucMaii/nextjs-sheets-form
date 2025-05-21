importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js',
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
