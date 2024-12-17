import React from 'react';
import AuthenGuard from '@/HOC/AuthenGuard';
import { Typography } from '@mui/material';

export default function page() {
  return (
    <AuthenGuard>
        <Typography>LANDING PAGE</Typography>
    </AuthenGuard>
  );
}
