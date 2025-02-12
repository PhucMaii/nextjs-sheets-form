import AuthenGuard from '@/HOC/AuthenGuard';
import React, { ReactNode } from 'react';
import Navbar from '../components/LandingPage/Navbar';
import { Box, useMediaQuery } from '@mui/material';

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  return (
    <AuthenGuard>
      <Box>
        <Navbar />
        <Box sx={{mx: 0, px: 0}} mt={!mdDown ? '140px' : 0}>{children}</Box>
      </Box>
    </AuthenGuard>
  );
}
