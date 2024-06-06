import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  notification: Notification;
  onClose: () => void;
  anchorOrigin?: any;
}

export default function NotificationPopup({
  notification,
  onClose,
  anchorOrigin,
}: PropTypes) {
  return (
    <Snackbar
      open={notification.on}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={
        anchorOrigin ? anchorOrigin : { vertical: 'bottom', horizontal: 'left' }
      }
    >
      <Alert severity={notification.type}>{notification.message}</Alert>
    </Snackbar>
  );
}
