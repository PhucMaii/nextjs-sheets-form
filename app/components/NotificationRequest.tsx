import { Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../admin/components/Modals/styled';
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

  useEffect(() => {
    setNotiPermission(Notification.permission);
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
    } catch (error) {
      console.log('Fail to update driver noti: ', error);
      showNotification('error', 'Fail to update driver noti: ' + error);
    }
  };

  const enableNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setNotiPermission(permission);
        if (permission === 'granted') {
          subscribeUser();
        } else {
          showNotification('error', 'Notification permission is not granted');
        }
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

        if (registration) {
          generateSubscibeEndpoint(registration);
        } else {
          const newRegistration =
            await navigator.serviceWorker.register('/sw.js');

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

    const subscription = await newRegistration.pushManager.subscribe(options);

    await updateDriverNoti(subscription);
  };

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
