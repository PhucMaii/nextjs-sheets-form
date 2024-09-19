import NotificationPopup from '@/app/admin/components/Notification';
import { Notification } from '@/app/utils/type';
import { AlertColor } from '@mui/material';
import { useState } from 'react';

const useNotification = () => {
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
