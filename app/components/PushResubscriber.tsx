'use client';

import { useEffect } from 'react';
import { urlB64ToUint8Array } from './NotificationRequest';

export default function PushReSubscriber() {
  useEffect(() => {
    async function ensureSubscription() {
      if (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        Notification.permission === 'granted'
      ) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
          const newSub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY!),
          });

          await fetch('/api/save-subscription', {
            method: 'POST',
            body: JSON.stringify(newSub),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('✅ Re-subscribed and saved to backend.');
        }
      }
    }

    ensureSubscription();
  }, []);

  return null;
}