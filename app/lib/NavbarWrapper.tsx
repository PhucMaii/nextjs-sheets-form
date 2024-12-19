import AuthenGuard from '@/HOC/AuthenGuard';
import React, { ReactNode } from 'react';
import Navbar from '../components/LandingPage/Navbar';
import { Box } from '@mui/material';

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthenGuard>
      <Box>
        <Navbar />
        {children}
      </Box>
    </AuthenGuard>
  );
}
