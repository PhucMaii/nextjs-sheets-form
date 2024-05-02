import { SplashScreen } from '@/app/HOC/AuthenGuard';
import { Modal } from '@mui/material';
import React from 'react';

export default function LoadingModal({ open }: { open: boolean }) {
  return (
    <Modal open={open}>
      <SplashScreen />
    </Modal>
  );
}
