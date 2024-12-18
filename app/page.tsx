'use client';
import React from 'react';
import AuthenGuard from '@/HOC/AuthenGuard';
import { Box } from '@mui/material';
import Navbar from './components/LandingPage/Navbar';
import Header from './components/LandingPage/Header';
import HowItWorks from './components/LandingPage/HowItWorks';
import TrustedBrand from './components/LandingPage/TrustedBrand';
import BestSeller from './components/LandingPage/BestSeller';
import InvitationSection from './components/LandingPage/InvitationSection';
import Footer from './components/LandingPage/Footer';

export default function page() {
  return (
    <AuthenGuard>
      <Box display="flex" flexDirection="column" gap={4} width="100vw" height="100vh" sx={{backgrounColor: 'white'}}>
        <Navbar />
        <Header />
        <HowItWorks />
        <TrustedBrand />
        <Box>
          <BestSeller />
          <InvitationSection />
        </Box>
        <Footer />
      </Box>
    </AuthenGuard>
  );
}
