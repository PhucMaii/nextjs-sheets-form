import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  notification: Notification;
  onClose: () => void;
}

export default function NotificationPopup({
  notification,
  onClose,
}: PropTypes) {
  return (
    <Snackbar open={notification.on} autoHideDuration={5000} onClose={onClose}>
      <Alert severity={notification.type}>{notification.message}</Alert>
    </Snackbar>
  );
}
