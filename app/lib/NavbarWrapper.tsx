import AuthenGuard from '@/HOC/AuthenGuard';
import React, { ReactNode } from 'react';
import Navbar from '../components/LandingPage/Navbar';
import { Box, useMediaQuery } from '@mui/material';

export default function NavbarWrapper({
  children,
  setIsOpenSignUp,
}: {
  children: ReactNode;
  setIsOpenSignUp: any;
}) {
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  return (
    <AuthenGuard>
      <Box>
        <Navbar setIsOpenSignUp={setIsOpenSignUp} />
        <Box mt={!mdDown ? "140px" : 0}>{children}</Box>
      </Box>
    </AuthenGuard>
  );
}
