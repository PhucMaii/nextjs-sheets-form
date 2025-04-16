importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js',
);
import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);

export function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String?.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData?.length);
  for (let i = 0; i < rawData?.length; ++i) {
    outputArray[i] = rawData?.charCodeAt(i);
  }
  return outputArray;
}

const updateDriverNoti = async (subscription) => {
  try {
    const response = await axios.post(`/api/drivers/save-noti`, {
      notiJson: JSON.stringify(subscription),
    });

    if (response.data.error) {
      showNotification('error', response.data.error);
    }
  } catch (error) {
    console.log('Fail to update driver noti: ', error);
    showNotification('error', 'Fail to update driver noti: ' + error);
  }
};

self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  self.skipWaiting(); // activate immediately
});

self.addEventListener('fetch', (event) => {
  console.log('🔍 Fetch intercepted:', event.request.url);
});

self.addEventListener('activate', async (e) => {
  console.log('🚀 Service Worker activating...');
  // const subscription = await self.registration.pushManager.subscribe({
  //   userVisibleOnly: true,
  //   applicationServerKey: urlB64ToUint8Array(),
  // });

  // const response = await updateDriverNoti(subscription);
  // console.log(response);
});

self.addEventListener('push', async (e) => {
  const data = JSON.parse(e.data.text());

  const title = data?.message || 'Notification';
  const body = data?.body || '';

  console.log(data, 'data in push event');

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
