import { Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../admin/[companyId]/components/Modals/styled';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import { grey } from '@mui/material/colors';

export function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationRequest() {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notiPermission, setNotiPermission] = useState<
    'granted' | 'denied' | 'default'
  >('granted');

  const { showNotification, NotificationComp } = useNotification();

  // useEffect(() => {
  //   if (Notification.permission !== 'granted') {
  //     trySubscribeToPush();
  //   }
  //   setNotiPermission(Notification.permission);
  // }, []);

  // useEffect(() => {
  //   console.log('Notification.permission', Notification.permission);
  //   if (Notification.permission === 'granted') {
  //     trySubscribeToPush();
  //   }
  // }, [Notification.permission]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('Notification' in window)
    ) {
      console.warn('❌ Push not supported on this device');
      return;
    } else {
      const autoSubscribe = async () => {
        if (
          Notification.permission === 'granted' &&
          (await navigator.serviceWorker.ready).pushManager.getSubscription() ==
            null
        ) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();

          if (!subscription) {
            console.log('📦 No subscription found, subscribing...');
            await subscribeUser(); // or trySubscribeToPush()
          } else {
            console.log('📦 Already subscribed:', subscription);
          }
        }
      };

      setNotiPermission(Notification.permission);
      autoSubscribe();
    }
  }, []);

  useEffect(() => {
    if (notiPermission !== 'granted') {
      setOpen(true);
    }
  }, [notiPermission]);

  const updateDriverNoti = async (subscription: any) => {
    try {
      const response = await axios.post(`/api/drivers/save-noti`, {
        notiJson: JSON.stringify(subscription),
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
      }

      await confirmAllowNotification();
    } catch (error) {
      console.log('Fail to update driver noti: ', error);
      showNotification('error', 'Fail to update driver noti: ' + error);
    }
  };

  const confirmAllowNotification = async () => {
    try {
      const response = await axios.post(`/api/push-notification/confirm-allow`);

      if (response.data.error) {
        showNotification('error', response.data.error);
      }
    } catch (error) {
      console.log('Fail to confirm allow notification: ', error);
      showNotification('error', 'Fail to confirm allow notification: ' + error);
    }
  };

  const enableNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setNotiPermission(permission);
        subscribeUser();
      });
    } else {
      showNotification(
        'error',
        'Notifications are not supported in this browser.',
      );
    }

    setOpen(false);
  };

  const subscribeUser = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        console.log(registration, 'registration');

        if (registration) {
          generateSubscibeEndpoint(registration);
        } else {
          const newRegistration =
            await navigator.serviceWorker.register('/sw.js');

          console.log(newRegistration, 'newRegistration');
          generateSubscibeEndpoint(newRegistration);
        }
      } catch (error) {
        showNotification(
          'error',
          'Error during service worker registration or subscription',
        );
      }
    } else {
      showNotification(
        'error',
        'Service workers are not supported in this browser.',
      );
    }
  };

  const generateSubscibeEndpoint = async (
    newRegistration: ServiceWorkerRegistration,
  ) => {
    const applicationServerKey = urlB64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_KEY!,
    );

    const options: any = {
      applicationServerKey,
      userVisibleOnly: true,
    };

    console.log('Subscription options:', options);

    const existing = await newRegistration.pushManager.getSubscription();
    console.log('Existing subscription:', existing);

    if (existing) {
      console.log('📦 Existing subscription found:', existing);
      await updateDriverNoti(existing); // Optionally resync to backend
      return;
    }

    try {
      const subscription = await newRegistration.pushManager.subscribe(options);
      console.log('✅ New subscription:', subscription);
      await updateDriverNoti(subscription);
    } catch (error) {
      console.error('Error during subscription:', error);
      showNotification('error', 'Error during subscription');
    }
  };

  // async function trySubscribeToPush() {
  //   const registration = await navigator.serviceWorker.ready;

  //   const existingSub = await registration.pushManager.getSubscription();

  //   if (existingSub) {
  //     console.log('📦 Already subscribed:', existingSub);
  //     return;
  //   }

  //   const newSub = await registration.pushManager.subscribe({
  //     userVisibleOnly: true,
  //     applicationServerKey: urlB64ToUint8Array(
  //       process.env.NEXT_PUBLIC_VAPID_KEY!,
  //     ),
  //   });

  //   console.log('✅ New subscription:', newSub);

  //   // Save to backend
  //   await updateDriverNoti(newSub);
  // }
  return (
    <>
      {NotificationComp}
      <Modal open={open}>
        <BoxModal>
          <Typography variant="h6" textAlign="center">
            Get Notification
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            sx={{ color: grey[700] }}
          >
            Allow Notification to receive notifications from admin
          </Typography>
          <LoadingButton
            onClick={enableNotification}
            sx={{ mt: 2 }}
            variant="contained"
            fullWidth
          >
            Allow
          </LoadingButton>
        </BoxModal>
      </Modal>
    </>
  );
}
