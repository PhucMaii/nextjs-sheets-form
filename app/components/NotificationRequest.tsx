import { Box, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../admin/components/Modals/styled';
import { LoadingButton } from '@mui/lab';
import { ModalProps } from '../admin/components/Modals/type';
import { ShowNotificationType } from '@/hooks/useNotification';

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

interface IProps extends ModalProps {
    showNotification: ShowNotificationType;
}

export default function NotificationRequest({
  showNotification,
  open,
  onClose,
}: IProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notiPermission, setNotiPermission] = useState<
    'granted' | 'denied' | 'default'
  >('granted');

  useEffect(() => {
    setNotiPermission(Notification.permission);
  }, []);

  const updateDriverNoti = async (subscription) => {};

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

    onClose();
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
    <Modal open={open}>
      <BoxModal>
        <Typography>Please Allow Notification</Typography>
        <LoadingButton onClick={enableNotification}>Allow</LoadingButton>
      </BoxModal>
    </Modal>
  );
}
