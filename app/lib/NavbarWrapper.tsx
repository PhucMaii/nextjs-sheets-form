import AuthenGuard from '@/HOC/AuthenGuard';
import React, { ReactNode } from 'react';
import Navbar from '../components/LandingPage/Navbar';
import { Box } from '@mui/material';

export default function NavbarWrapper({ children, setIsOpenSignUp }: { children: ReactNode, setIsOpenSignUp: any }) {
  return (
    <AuthenGuard>
      <Box>
        <Navbar setIsOpenSignUp={setIsOpenSignUp} />
        <Box mt='80px'>
          {children}
        </Box>
      </Box>
    </AuthenGuard>
  );
}
