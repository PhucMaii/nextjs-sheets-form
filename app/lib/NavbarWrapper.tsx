import AuthenGuard from '@/HOC/AuthenGuard';
import React, { ReactNode } from 'react';
import Navbar from '../components/LandingPage/Navbar';
import { Box, useMediaQuery } from '@mui/material';
import Footer from '../components/LandingPage/Footer';

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  return (
    <AuthenGuard>
      <Box>
        <Navbar style={{position: 'fixed', zIndex: 100}} />
        <Box display="flex" flexDirection="column" sx={{ mx: 0, px: 0, pt: mdDown ? '140px' : 0, overflowX: 'hidden' }} mt={!mdDown ? '140px' : 0}>
          {children}
          <Footer />
        </Box>
      </Box>
    </AuthenGuard>
  );
}
