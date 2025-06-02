import React from 'react';
import NotificationPopup from '@/app/admin/[companyId]/components/Notification';
import { Notification } from '@/app/utils/type';
import { AlertColor } from '@mui/material';
import { useState } from 'react';

export type ShowNotificationType = (type: AlertColor, message: string) => void;

const useNotification = (anchorOrigin: any = null) => {
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });

  const closeNotification = () => {
    setNotification({
      on: false,
      type: 'info',
      message: '',
    });
  };

  const showNotification = (type: AlertColor, message: string) => {
    setNotification({
      on: true,
      type: type,
      message: message,
    });
  };

  const NotificationComp = (
    <NotificationPopup
      notification={notification}
      onClose={closeNotification}
      anchorOrigin={anchorOrigin || { vertical: 'top', horizontal: 'center' }}
    />
  );

  return {
    notification,
    showNotification,
    closeNotification,
    NotificationComp,
  };
};

export default useNotification;
